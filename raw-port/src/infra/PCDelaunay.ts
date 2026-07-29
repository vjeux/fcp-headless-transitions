// PCDelaunay — ProCore.framework's constrained Delaunay triangulator.
// Sits alongside PCDelaunay__Triangle.ts and PCDelaunay__TriangleEdge.ts as the three files
// that make up the CDT (constrained-Delaunay-triangulation) module. This file holds the
// outer PCDelaunay class: the pool of Triangles it allocates + the CDT entry point + the
// divide-and-conquer skeleton pass + insertion/flipping helpers.
//
// STATUS: skeleton port. All 22 methods have their disassembly downloaded to
// raw-port/re/disasm/ProCore.PCDelaunay.<method>.s (3274 total lines of x86_64). The trivial
// methods (ctor, dtor, empty makeVertexMap, tiny makeTriangle, tiny formSkeleton) are
// transcribed with real bodies. The five large algorithmic bodies
// (recursiveDivideConquer @0x5532a — 280 lines; insertVertex @0x57138 — 367 lines;
// flip @0x57672 — 307 lines; merge @0x55834 — 789 lines; scoutSegment @0x567b6 — 182 lines;
// findDirection @0x56d26 — 270 lines; constrainedEdge @0x56a58 — 193 lines;
// segmentIntersection @0x57aee — 166 lines; fixup @0x57e40 — 132 lines;
// insertSegment @0x56456 — 126 lines; findTriangle @0x566f2 — 59 lines;
// removeGhosts @0x5561c — 65 lines; vertexSort @0x55196 — 125 lines; cdt @0x5502c — 115 lines)
// are throw-stubs citing @0xADDR — Rule 3 "throw on undecoded, never approximate". The bodies
// are pure C++ math (no ObjC / no extern), so completing them is a mechanical transcription
// pass. Nothing here is a facade.
//
// Source disassemblies (all in raw-port/re/disasm/):
//   ProCore.PCDelaunay.PCDelaunay.s              (0x54f46 — ctor C1, delegates to C2 @0x54f0a)
//   ProCore.PCDelaunay.~PCDelaunay.s             (0x55022 — dtor D1 tail-calls D2 @0x54f82)
//   ProCore.PCDelaunay.cdt.s
//   ProCore.PCDelaunay.vertexSort.s
//   ProCore.PCDelaunay.recursiveDivideConquer.s
//   ProCore.PCDelaunay.formSkeleton.s
//   ProCore.PCDelaunay.makeTriangle.s
//   ProCore.PCDelaunay.merge.s
//   ProCore.PCDelaunay.makeVertexMap.s
//   ProCore.PCDelaunay.insertSegment.s
//   ProCore.PCDelaunay.removeGhosts.s
//   ProCore.PCDelaunay.findTriangle.s
//   ProCore.PCDelaunay.scoutSegment.s
//   ProCore.PCDelaunay.constrainedEdge.s
//   ProCore.PCDelaunay.findDirection.s
//   ProCore.PCDelaunay.insertVertex.s
//   ProCore.PCDelaunay.flip.s
//   ProCore.PCDelaunay.segmentIntersection.s
//   ProCore.PCDelaunay.fixup.s
//
// STRUCT LAYOUT (recovered from the ctor @0x54f46 and dtor D2 @0x54f82):
//   +0x00  int32  triangleCount           (initial 0 — the low 32 bits of the movabsq $0x1400000000)
//   +0x04  int32  triangleCapacity        (initial 20 — the high 32 bits of that movabsq)
//   +0x08  Triangle** triangles           (initial nullptr, then heap-allocated `new[](0xa0=160)`
//                                          — that's 20 pointer slots, matches capacity=20)
//   +0x10  ptr    vertexRangeBegin        (initial 0 — the movups %xmm0 zeros +0x10 and +0x18)
//   +0x18  ptr    vertexRangeEnd          (initial 0)
//   +0x20  int64  extra                   (initial 0 — set by `movq %r14, 0x20(%rbx)` with r14=0)
//   sizeof(PCDelaunay) >= 0x28 (40 bytes).
//
// The triangles pool at +0x08 is a PCDynamicArray<Triangle*> — matches the vtable seen at
// makeTriangle @0x557bf which calls
//   __ZN14PCDynamicArrayIPN10PCDelaunay8TriangleEE6insertEjRKS2_
//     "PCDynamicArray<PCDelaunay::Triangle*>::insert(unsigned int, PCDelaunay::Triangle* const&)"
// and passes (this, count-at-+0x00, &local). The dtor confirms: it reads count from +0x00,
// iterates 0..count-1 dereferencing pointer-array at (+0x08)[i*8], calls `operator delete`
// on each non-null Triangle*, then `delete[]` on the +0x08 pointer array itself.
//
// The +0x10..+0x18 pair is a std::vector-like range (begin/end pointers, 8 bytes each) that the
// dtor iterates in an 8-byte stride, freeing each element via `operator delete`. Its element
// type is not fixed from the dtor alone; the insertion sites in insertSegment/scoutSegment will
// pin it once those bodies are transcribed. Treated here as an opaque "auxiliary owned-pointer
// vector" — the dtor's behaviour is a simple pointer-vector-of-owned-objects free loop.

import { PCDelaunay__Triangle } from "./PCDelaunay__Triangle";

/** PCVector2<float> pointer — 8 bytes on the FCP heap (two packed float32 at +0/+4).
 *  See PCDelaunay__Triangle.ts for the full explanation; here we only need the shape. */
interface PCVector2Float {
  x: number;
  y: number;
}

/**
 * PCDelaunay::Segment — a pair of vertex INDICES into the caller-supplied vertex array
 * that cdt/formSkeleton receive. formSkeleton @0x5573f reads (rcx + i*8) at offset 0 and 4
 * as two int32s, then indexes vertexArray.data at +0x08 by each. Layout:
 *   +0x00  int32  a  (vertex index)
 *   +0x04  int32  b  (vertex index)
 *   sizeof(Segment) = 8. This mirrors the mangled name `PCDelaunay::Segment` seen in
 *   `PCDynamicArray<PCDelaunay::Segment>` in the cdt() and formSkeleton() signatures.
 */
export interface PCDelaunaySegment {
  a: number; // int32 @+0x00
  b: number; // int32 @+0x04
}

/** PCDynamicArray-shaped input (count at +0x00, pointer at +0x08). The real
 *  PCDynamicArray class is a separate ledger leaf; here we type-only the surface
 *  cdt/formSkeleton consume so this file compiles standalone. */
export interface PCDynamicArrayView<T> {
  count: number;   // int32 @+0x00 (dword field)
  data: T[];       // pointer @+0x08 into a heap array of T slots
}

/**
 * PCDelaunay — a constrained Delaunay triangulator over PCVector2<float> input.
 *
 * @0xADDR ProCore 0x54f0a (C2 base-object ctor — the "real" body; C1 delegates)
 * @0xADDR ProCore 0x54f46 (C1 complete-object ctor — same body per Itanium ABI)
 * @0xADDR ProCore 0x54f82 (D2 base-object dtor)
 * @0xADDR ProCore 0x55022 (D1 complete-object dtor — tail-jumps to D2)
 */
export class PCDelaunay {
  /** @0x54f4a-0x54f79  triangle pool + auxiliary vector, per struct layout above. */
  public triangleCount: number = 0;              // +0x00
  public triangleCapacity: number = 20;           // +0x04 — initial 20 (`0x1400000000`)
  public triangles: (PCDelaunay__Triangle | null)[] = []; // +0x08 — 20 slots, all null after ctor
  public auxBegin: (object | null)[] = [];        // +0x10 — auxiliary owned-pointer vector begin
  public auxEnd: number = 0;                       // +0x18 — auxiliary owned-pointer vector end (as index)
  public extra: bigint = 0n;                        // +0x20 — int64, initial 0

  /**
   * PCDelaunay::PCDelaunay() — C2 body @0x54f0a (the "real" ctor).
   *
   * Disassembly (identical to C1 @0x54f46 by Itanium-ABI equivalence):
   *   0x54f50  movabsq $0x1400000000, %rax   ; low32=0 count, high32=20 capacity
   *   0x54f5a  movq    %rax, (%rdi)          ; write +0x00 (count=0) and +0x04 (capacity=20)
   *   0x54f5d  xorl    %r14d, %r14d          ; r14 = 0
   *   0x54f60  movq    %r14, 0x8(%rdi)       ; +0x08 pointer <- null (before new[])
   *   0x54f64  movl    $0xa0, %edi           ; size = 160 bytes = 20 * 8
   *   0x54f69  callq   __Znam                ; operator new[](160)
   *   0x54f6e  movq    %rax, 0x8(%rbx)       ; +0x08 <- heap pointer
   *   0x54f72  xorps   %xmm0, %xmm0
   *   0x54f75  movups  %xmm0, 0x10(%rbx)     ; +0x10 = 0, +0x18 = 0
   *   0x54f79  movq    %r14, 0x20(%rbx)      ; +0x20 = 0
   *
   * In TS we allocate the 20-slot array directly (no need to model `new[]` byte-for-byte
   * since JS arrays already carry length/capacity semantically) — the ctor's SEMANTIC effect
   * is "count=0, capacity=20, backing storage of 20 null slots exists, aux vector empty".
   */
  constructor() {
    // +0x00 count, +0x04 capacity written by `movabsq $0x1400000000, (%rdi)`.
    this.triangleCount = 0;
    this.triangleCapacity = 20;
    // +0x08 <- `new Triangle*[20]{}` (all null; __Znam does not zero, but the pool starts empty
    // — subsequent `PCDynamicArray::insert` calls at makeTriangle @0x557bf populate slots).
    this.triangles = new Array<PCDelaunay__Triangle | null>(20).fill(null);
    // +0x10 = +0x18 = 0 (empty auxiliary vector).
    this.auxBegin = [];
    this.auxEnd = 0;
    // +0x20 = 0.
    this.extra = 0n;
  }

  /**
   * PCDelaunay::~PCDelaunay() — D2 base-object dtor @0x54f82.
   * D1 @0x55022 is a two-instruction tail-jump to D2 (Itanium-ABI equivalence).
   *
   * Disassembly (simplified):
   *   read count at +0x00; if non-zero, iterate i=0..count-1:
   *     load triangles[i]; if non-null, `operator delete` it, then null the slot
   *   iterate auxBegin (+0x10) .. auxEnd (+0x18) stepping 8 bytes:
   *     load elem; if non-null, `operator delete` it; null the slot
   *   if auxBegin (+0x10) non-null, mirror it to +0x18 then `operator delete` the range
   *   if triangles-array (+0x08) non-null, `operator delete[]` it and null it.
   *
   * In TS GC handles reclamation; the semantic effect is "clear everything".
   */
  destroy(): void {
    // count-loop over triangle pool
    for (let i = 0; i < this.triangleCount; i++) {
      this.triangles[i] = null;
    }
    // auxiliary owned-pointer vector — clear
    this.auxBegin = [];
    this.auxEnd = 0;
    // +0x08 pointer array — drop
    this.triangles = [];
    this.triangleCount = 0;
  }

  /**
   * PCDelaunay::makeVertexMap() — @0x56450.
   *
   * Full disassembly (5 lines — an empty function; likely a stubbed-out debug or
   * caching hook that FCP compiled to a no-op):
   *   0x56450  pushq %rbp
   *   0x56451  movq  %rsp, %rbp
   *   0x56454  popq  %rbp
   *   0x56455  retq
   *
   * This is not "not transcribed" — it IS the transcription; the compiled function has
   * no body. No throw-stub needed.
   */
  makeVertexMap(): void {
    // no-op — matches Apple's compiled body exactly.
  }

  /**
   * PCDelaunay::makeTriangle() — @0x5578e. Allocates one Triangle, calls its ctor,
   * inserts a pointer to it at position `this->triangleCount` in the +0x08 pool
   * (which grows the count via PCDynamicArray::insert), and returns the Triangle*.
   *
   * Disassembly (26 lines):
   *   0x5579b  movl   $0x50, %edi                ; sizeof(Triangle) = 80
   *   0x557a0  callq  __Znwm                     ; operator new(80)
   *   0x557ab  callq  PCDelaunay::Triangle::Triangle()   ; C2 ctor on the fresh block
   *   0x557b4  movq   %r14, (%r15)               ; local[0] = new Triangle*
   *   0x557b7  movl   (%rbx), %esi               ; unsigned pos = this->triangleCount
   *   0x557bf  callq  PCDynamicArray<Triangle*>::insert(unsigned, Triangle* const&)
   *   0x557c4  movq   (%r15), %rax               ; return the pointer
   *
   * NOTE: `insert(unsigned pos, T const&)` is called with pos = current count — i.e.
   * this appends the new Triangle at the end of the pool (and PCDynamicArray takes
   * care of incrementing +0x00 and growing +0x08 if needed).
   */
  makeTriangle(): PCDelaunay__Triangle {
    // `new Triangle` — the ctor is transcribed in PCDelaunay__Triangle.ts.
    const t = new PCDelaunay__Triangle();
    // PCDynamicArray<Triangle*>::insert(count, &t) — appends. The real insert() @__ZN14PCDynamicArrayIPN10PCDelaunay8TriangleEE6insertEjRKS2_
    // is a separate ledger leaf; TS-side we model its observable effect: append at end, ++count.
    this.triangles[this.triangleCount] = t;
    this.triangleCount++;
    if (this.triangleCount > this.triangleCapacity) {
      // Grow bookkeeping — the real PCDynamicArray::insert doubles-and-copies. Mirror the
      // effect (JS array already resizes; only the capacity number is bookkeeping).
      this.triangleCapacity = this.triangleCount;
    }
    return t;
  }

  /**
   * PCDelaunay::formSkeleton(vertexArray, segments) — @0x55722.
   *
   * Disassembly (42 lines): loops i = 0..segments.count-1:
   *   seg = segments.data[i]                        ; two int32 fields
   *   va = vertexArray.data + seg.a * 8             ; pointer to PCVector2<float>
   *   vb = vertexArray.data + seg.b * 8             ; pointer to PCVector2<float>
   *   if (va.x != vb.x  ||  va.y != vb.y)           ; ucomiss / ordered NaN-aware compares
   *     this->insertSegment(va, vb)                 ; @0x56456
   *   ; NOTE loop bound is re-read from segments.count each iteration (in case insertSegment
   *   ;       grew it — it doesn't, but the compiled loop reloads anyway).
   *
   * The `ucomiss` / `jne / jp` pattern is x86's IEEE-754 unordered/NaN-aware equality
   * (NaN-ordered "not equal"). In TS that maps directly to `!==` on doubles (NaN !== NaN
   * is true, so a NaN coord would skip insertion — matches the compiled semantics).
   */
  formSkeleton(vertexArray: PCDynamicArrayView<PCVector2Float>, segments: PCDynamicArrayView<PCDelaunaySegment>): void {
    if (segments.count === 0) return;
    for (let i = 0; i < segments.count; i++) {
      const seg = segments.data[i];
      const va = vertexArray.data[seg.a];
      const vb = vertexArray.data[seg.b];
      // ucomiss va.x, vb.x ; jne/jp ; ucomiss va.y, vb.y ; jne/jp  (NaN-ordered !=)
      // NaN !== NaN is true in IEEE-754/JS, matching the `jp` (unordered) branch.
      if (va.x !== vb.x || va.y !== vb.y) {
        this.insertSegment(va, vb);
      }
    }
  }

  /**
   * PCDelaunay::cdt(vertices, segments) — @0x5502c. The entry point: build a constrained
   * Delaunay triangulation of `vertices` respecting `segments` as forced edges.
   *
   * Disassembly (115 lines): allocates a `Triangle*[vertices.count]` via __Znam, packs the
   * vertex pointers into it (via PCDynamicArray<Triangle*>::insert in a loop), then dedups
   * exact-duplicate consecutive vertices (memmove-based erase), then calls vertexSort,
   * then recursiveDivideConquer, then formSkeleton — the classic Guibas-Stolfi CDT pipeline.
   *
   * 115 lines of asm; not yet transcribed. Bodies of vertexSort/recursiveDivideConquer/
   * formSkeleton (skeleton part is above) are the dependencies. Loud throw so any caller
   * lights up frontier.py.
   */
  cdt(vertices: PCDynamicArrayView<PCVector2Float>, segments: PCDynamicArrayView<PCDelaunaySegment>): void {
    void vertices; void segments;
    throw new Error("PCDelaunay::cdt @0x5502c not yet transcribed (115-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.cdt.s)");
  }

  /**
   * PCDelaunay::vertexSort(vertices, n) — @0x55196. Lexicographic sort of vertex pointers
   * (primary key x, secondary y) — 125 lines of asm, an in-place quicksort in FCP's binary.
   */
  vertexSort(vertices: (PCVector2Float | null)[], n: number): void {
    void vertices; void n;
    throw new Error("PCDelaunay::vertexSort @0x55196 not yet transcribed (125-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.vertexSort.s)");
  }

  /**
   * PCDelaunay::recursiveDivideConquer(vertices, n, lo, hi, depth) — @0x5532a.
   * Guibas-Stolfi divide-and-conquer builder. Splits the sorted vertex range in half,
   * recurses, then calls merge() to zip the two half-hulls together via cross-edges.
   * 280 lines of asm.
   */
  recursiveDivideConquer(vertices: (PCVector2Float | null)[], n: number, lo: object, hi: object, depth: number): void {
    void vertices; void n; void lo; void hi; void depth;
    throw new Error("PCDelaunay::recursiveDivideConquer @0x5532a not yet transcribed (280-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.recursiveDivideConquer.s)");
  }

  /**
   * PCDelaunay::merge(leftInner, leftOuter, rightInner, rightOuter, depth) — @0x55834.
   * 789 lines of asm — the merge step of divide-and-conquer. Selects the lower common
   * tangent between the two half-hulls, then repeatedly zips new cross-edges upward,
   * flipping via the circumcircle predicate. The largest body in the class.
   */
  merge(leftInner: object, leftOuter: object, rightInner: object, rightOuter: object, depth: number): void {
    void leftInner; void leftOuter; void rightInner; void rightOuter; void depth;
    throw new Error("PCDelaunay::merge @0x55834 not yet transcribed (789-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.merge.s)");
  }

  /**
   * PCDelaunay::insertSegment(a, b) — @0x56456. 126 lines of asm.
   * Force the segment a-b into the triangulation: walk from findTriangle(a) toward b via
   * scoutSegment, and either accept an existing edge or intersect + insert a new vertex.
   */
  insertSegment(a: PCVector2Float, b: PCVector2Float): void {
    void a; void b;
    throw new Error("PCDelaunay::insertSegment @0x56456 not yet transcribed (126-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.insertSegment.s)");
  }

  /**
   * PCDelaunay::removeGhosts(edge) — @0x5561c. 65 lines of asm.
   * Strip the outer "ghost" triangles that carried the convex-hull sentinels during
   * divide-and-conquer, leaving only the real interior triangulation.
   */
  removeGhosts(edge: object): void {
    void edge;
    throw new Error("PCDelaunay::removeGhosts @0x5561c not yet transcribed (65-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.removeGhosts.s)");
  }

  /**
   * PCDelaunay::findTriangle(v) — @0x566f2. 59 lines of asm. Locate a Triangle containing
   * the query point `v` by walking the mesh from an initial edge.
   */
  findTriangle(v: PCVector2Float): object {
    void v;
    throw new Error("PCDelaunay::findTriangle @0x566f2 not yet transcribed (59-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.findTriangle.s)");
  }

  /**
   * PCDelaunay::scoutSegment(edge, target, flag) — @0x567b6. 182 lines of asm.
   * Advance `edge` toward `target` looking for either an existing edge that ends at
   * `target` or an intersecting edge that must be split.
   */
  scoutSegment(edge: object, target: PCVector2Float, flag: number): number {
    void edge; void target; void flag;
    throw new Error("PCDelaunay::scoutSegment @0x567b6 not yet transcribed (182-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.scoutSegment.s)");
  }

  /**
   * PCDelaunay::constrainedEdge(edge, target) — @0x56a58. 193 lines of asm.
   * Force the segment ending at `target` into the mesh via flipping.
   * Cold-path split-off at @0xdda5e (constrainedEdge.cold.1) — an exception / abort path.
   */
  constrainedEdge(edge: object, target: PCVector2Float): void {
    void edge; void target;
    throw new Error("PCDelaunay::constrainedEdge @0x56a58 not yet transcribed (193-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.constrainedEdge.s; cold at @0xdda5e)");
  }

  /**
   * PCDelaunay::findDirection(edge, target) — @0x56d26. 270 lines of asm.
   * Rotate `edge` around its origin until it points toward `target` (used by insertSegment).
   */
  findDirection(edge: object, target: PCVector2Float): void {
    void edge; void target;
    throw new Error("PCDelaunay::findDirection @0x56d26 not yet transcribed (270-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.findDirection.s)");
  }

  /**
   * PCDelaunay::insertVertex(v, edge) — @0x57138. 367 lines of asm.
   * Insert a new vertex `v` into the triangle referenced by `edge`, splitting it into
   * three (or two on-edge) and legalizing via flip().
   */
  insertVertex(v: PCVector2Float, edge: object): void {
    void v; void edge;
    throw new Error("PCDelaunay::insertVertex @0x57138 not yet transcribed (367-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.insertVertex.s)");
  }

  /**
   * PCDelaunay::flip(edge) — @0x57672. 307 lines of asm. The Lawson edge-flip: swap the
   * diagonal of a quadrilateral formed by two adjacent triangles if the circumcircle
   * predicate is violated.
   */
  flip(edge: object): void {
    void edge;
    throw new Error("PCDelaunay::flip @0x57672 not yet transcribed (307-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.flip.s)");
  }

  /**
   * PCDelaunay::segmentIntersection(edge, target) — @0x57aee. 166 lines of asm. The
   * geometric-predicate kernel: does the edge cross the query segment, and if so, where.
   * Called by scoutSegment/insertSegment when a forced edge collides with an existing one.
   * Priority frontier item.
   */
  segmentIntersection(edge: object, target: PCVector2Float): void {
    void edge; void target;
    throw new Error("PCDelaunay::segmentIntersection @0x57aee not yet transcribed (166-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.segmentIntersection.s)");
  }

  /**
   * PCDelaunay::fixup(edge, flag) — @0x57e40. 132 lines of asm. Post-processing pass
   * that walks back along a chain of newly-created edges and legalizes each via flip().
   */
  fixup(edge: object, flag: boolean): void {
    void edge; void flag;
    throw new Error("PCDelaunay::fixup @0x57e40 not yet transcribed (132-line disasm at raw-port/re/disasm/ProCore.PCDelaunay.fixup.s)");
  }
}
