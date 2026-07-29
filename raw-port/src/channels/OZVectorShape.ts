// raw-port/src/channels/OZVectorShape.ts
//
// FCP `OZVectorShape` — Ozone's owning container for a filled/stroked 2D
// vector shape: it maintains a list of `OZQuadraticPath*` outlines and a
// tessellated triangle mesh (`PTTriangle` linked list) built on demand by
// `tesselate()`. Once tessellated, it can answer geometric queries:
//   isOnOutline(p)      — is point p within epsilon of an outline segment?
//   isInteriorPoint(p)  — is p inside the filled region (point-in-polygon)?
//   isCurveTriangle(t)  — is triangle t one of the curve-decoration tris?
//   isBoundaryTriangle(t) — is triangle t on the outline strip?
// plus a small subdivision helper (findAdjacentTriangle/subdivideAdjacentTriangle).
//
// Framework: Ozone
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// FAT slice: /tmp/Ozone.x86_64 (x86_64; VA==file offset)
//
// Ported symbols (all @Ozone):
//   @0x00000000003022f0  OZVectorShape::OZVectorShape()  [C1]
//                        __ZN13OZVectorShapeC1Ev
//                        (6-instr thunk, tail-JMP to C2 @0x301740)
//   @0x0000000000301740  OZVectorShape::OZVectorShape()  [C2 primary]
//                        __ZN13OZVectorShapeC2Ev
//                        (486 lines — installs vtable, seeds two internal
//                         allocations, sets epsilon = 0.0001 at this+0x58,
//                         seeds this+0x80 = 0x1400000000 magic pair, and
//                         initializes two std::list heads at this+0x60 /
//                         this+0x20 to their sentinel nodes. Throw-stubbed
//                         pending PCArray + std::list bookkeeping decode.)
//   @0x0000000000302550  OZVectorShape::~OZVectorShape()   [D0 -> D2 + delete]
//                        __ZN13OZVectorShapeD0Ev
//                        (calls D2 then operator delete)
//   @0x??? see .s        OZVectorShape::~OZVectorShape()   [D1/D2]
//                        __ZN13OZVectorShapeD{1,2}Ev
//   @0x000000000030a9f0  OZVectorShape::begin()
//                        __ZN13OZVectorShape5beginEv
//                        (5-instr; returns *(void**)(this+0x60) — head of
//                         the outline segment linked list)
//   @0x000000000030aa00  OZVectorShape::end()
//                        __ZN13OZVectorShape3endEv
//                        (5-instr; returns *(void**)(this+0x68) — tail
//                         sentinel of the outline segment linked list)
//   @0x00000000003035f0  OZVectorShape::isCurveTriangle(PTTriangle const&)
//                        __ZN13OZVectorShape15isCurveTriangleERK10PTTriangle
//                        (32-line linear scan through the this+0xc8 curve-
//                         triangle array of size this+0xc0, stride 0xa8;
//                         compares each entry via `PTTriangle::operator==`.
//                         REAL PORT below.)
//   @0x0000000000302570  OZVectorShape::addPath(OZQuadraticPath*)
//                        __ZN13OZVectorShape7addPathEP15OZQuadraticPath
//                        (75 lines — std::vector::push_back with capacity-
//                         doubling realloc. Container plumbing, throw-stub.)
//   @0x0000000000302a80  OZVectorShape::isOnOutline(PCVector2<float> const&)
//                        __ZN13OZVectorShape11isOnOutlineERK9PCVector2IfE
//                        (85 lines — walks the outline segment list at
//                         this+0x60 and for each segment computes the
//                         signed 2D cross product `(seg.end-seg.start) × (p-seg.start)`
//                         (abs-masked), compares against a double-precision
//                         epsilon 0.0001 loaded from Ozone .rodata @0x707b58
//                         (verified via resolve.py Ozone const), then checks
//                         `0 <= dot((p-seg.start),(seg.end-seg.start))` and
//                         `dot(...) <= |seg.end-seg.start|²`. For segments
//                         with `type==1` (single-point marker at seg.data+0),
//                         does a per-component `|p-endpoint|< 1e-5f` check.
//                         Throw-stubbed pending decode of the segment node
//                         layout (see .s for offsets).)
//   @0x0000000000302f50  OZVectorShape::isInteriorPoint(PCVector2<float> const&)
//                        __ZN13OZVectorShape15isInteriorPointERK9PCVector2IfE
//                        (311 lines — Bentley-Ottmann-style ray-crossing
//                         count on the tessellated mesh; throw-stubbed.)
//   @0x0000000000303650  OZVectorShape::isBoundaryTriangle(PTTriangle const*)
//                        __ZN13OZVectorShape18isBoundaryTriangleEPK10PTTriangle
//                        (300 lines — linear scan + edge-sharing test;
//                         throw-stubbed.)
//   @0x??? see disasm    OZVectorShape::compileOutlines()
//   @0x??? see disasm    OZVectorShape::tesselate()
//   @0x??? see disasm    OZVectorShape::findAdjacentTriangle(...)
//   @0x??? see disasm    OZVectorShape::subdivideAdjacentTriangle(...)
//     -- these are all left as throwing stubs citing @Ozone symbols.
//
// Callees walking the disasm:
//   __ZNK10PTTriangleeqERKS_    PTTriangle::operator==(PTTriangle const&) const
//                                (per-triangle equality; a separate leaf. NOT
//                                 to be approximated — throw-stubbed here.)
//
// STRUCT LAYOUT of `OZVectorShape` (recovered from C2 @0x301740 + accessors):
//   +0x000  vtable pointer            (installed @0x30175b: vt+0x10)
//   +0x008  std::list<...> sentinel   (this+0x8 = self-pointer; forms an
//                                      empty circular list — the "paths"
//                                      list holding OZQuadraticPath* nodes.
//                                      Head/tail at +0x8, +0x10; size at +0x18.)
//   +0x018  size_t                    paths list size (initialized 0)
//   +0x020  std::list<...> sentinel   (segment linked list header)
//   +0x030  ...                       xmm0-cleared 16-byte block
//   +0x040  int64                     (=0 in ctor)
//   +0x048  16-byte xmm1              rip-relative const @rip+0x403c24
//                                     (see C2 @0x30179c — a two-double or
//                                      four-float initializer; decode when
//                                      isInteriorPoint is ported)
//   +0x058  double epsilon = 0.0001   (0x3f1a36e2eb1c432d ≈ 1e-4;
//                                      confirmed by resolve.py Ozone const 0x707b58)
//   +0x060  void*    outlineHead      // returned by begin()
//   +0x068  void*    outlineTail      // returned by end() (sentinel)
//   +0x070  void*    outlineCap       // std::vector-style capacity end
//                                     // (see addPath @0x302588: `movq 0x70(%rdi), %rax`)
//   +0x080  uint64 = 0x1400000000     // magic pair (initial capacity? "20 slots
//                                     // preallocated" of some 4-byte entity)
//   +0x088  void*    pathBufBase      // __Znam(0x50) — 80-byte buffer
//   +0x090  uint64                    (=0x1400000000)
//   +0x098  int64                     (=0)
//   +0x0a0  int64                     — subsequent 160-byte __Znam(0xa0) block
//                                     see @0x3017f8 (`__Znam` size 0xa0)
//   +0x0c0  int32    curveTriCount    // count of PTTriangle in the "curve"
//                                     // triangle array. Read by
//                                     // isCurveTriangle @0x3035fa
//                                     // (`movl 0xc0(%rdi), %r15d`)
//   +0x0c8  PTTriangle* curveTris     // base of the curve-triangle array,
//                                     // stride 0xa8 bytes/element (see
//                                     // `addq $0xa8, %r14` at 0x303636).
//                                     // Read by isCurveTriangle @0x303609.
//
// PTTriangle stride (0xa8 = 168 bytes) matches a "triangle with 3 vertices +
// 3 edges + 3 curve-control points + neighbor pointers" layout — consistent
// with a tessellation node used by both curve-tri and interior-tri classifiers.

/**
 * Opaque forward-decl for `PTTriangle`. Its full layout (168 bytes; stride
 * `0xa8` in the curve-tri array) is out of scope for this class; it lives
 * with the PTTriangle port. The ONLY thing our ported methods need is
 * pointer-identity + `operator==` (which is a separate un-transcribed leaf).
 */
export interface PTTriangle {
  /** Marker so the interface isn't structurally empty. */
  readonly __ptTriangleBrand: unique symbol;
}

/**
 * Opaque forward-decl for `OZQuadraticPath` — an owning list of quadratic
 * Bézier segments. Full layout ported separately; here we only track path
 * pointer identity for `addPath`.
 */
export interface OZQuadraticPath {
  readonly __ozQuadraticPathBrand: unique symbol;
}

/**
 * `PTTriangle::operator==(PTTriangle const&) const`
 *   Symbol: `__ZNK10PTTriangleeqERKS_` @Ozone (see disasm callee at 0x303626)
 * Separate un-decoded leaf; throws by Rule 3.
 */
export function PTTriangle_operator_eq(_a: PTTriangle, _b: PTTriangle): boolean {
  throw new Error(
    "PTTriangle::operator==(PTTriangle const&) const @Ozone __ZNK10PTTriangleeqERKS_ not yet transcribed",
  );
}

/**
 * `OZVectorShape` — the C++ object shape modeled minimally for the methods
 * we DO port. Only the fields those methods touch are typed; other fields
 * exist in the C++ layout (see file header) but are inaccessible until
 * their owning method is ported.
 */
export interface OZVectorShape {
  /**
   * Head of the outline-segment std::list at C++ offset +0x60. `begin()`
   * returns exactly this pointer (via a single `movq 0x60(%rdi), %rax`).
   *
   * The list nodes carry per-segment data (endpoint, direction, type, etc.);
   * we keep the node type opaque because their layout is a separate concern.
   */
  readonly outlineHead: OZVectorShape_SegmentNode;

  /**
   * Tail sentinel of the outline-segment std::list at C++ offset +0x68.
   * `end()` returns this. In C++ this is the past-the-end iterator; walkers
   * loop `for (n = head; n != tail; n = n.next)`.
   */
  readonly outlineTail: OZVectorShape_SegmentNode;

  /**
   * Curve-triangle array size at C++ offset +0xc0. Read by isCurveTriangle
   * at @0x3035fa (`movl 0xc0(%rdi), %r15d`). Signed 32-bit but always
   * non-negative in the real code (allocated via `__Znam` at ctor time).
   */
  readonly curveTriCount: number;

  /**
   * Curve-triangle array base at C++ offset +0xc8. Read by isCurveTriangle
   * at @0x303609. Element stride is `0xa8` bytes (PTTriangle-sized) — in the
   * disasm see `addq $0xa8, %r14` at 0x303636.
   *
   * We model the array as a JS array of `PTTriangle` for the port; the real
   * memory layout is a contiguous C-array.
   */
  readonly curveTris: readonly PTTriangle[];
}

/**
 * A node in `OZVectorShape`'s outline segment list. Deliberately opaque —
 * the layout offsets used by isOnOutline (`+0x8` next-ptr, `+0x10` data-ptr,
 * `type` at `data+0`, endpoint at `data+0x4/0xc`) are not fully decoded
 * across sibling files, so we don't invent a typed struct that a downstream
 * port might misread.
 */
export interface OZVectorShape_SegmentNode {
  readonly __ozVectorShapeSegmentNodeBrand: unique symbol;
}

/**
 * `OZVectorShape::begin()` @0x30a9f0  (5 instructions)
 *   __ZN13OZVectorShape5beginEv
 *
 *   pushq %rbp; movq %rsp, %rbp; movq 0x60(%rdi), %rax; popq %rbp; retq
 *
 * Returns the head of the outline segment list — literally `this+0x60`
 * dereferenced. No branches, no allocation.
 */
export function OZVectorShape_begin(self: OZVectorShape): OZVectorShape_SegmentNode {
  return self.outlineHead;
}

/**
 * `OZVectorShape::end()` @0x30aa00  (5 instructions)
 *   __ZN13OZVectorShape3endEv
 *
 *   pushq %rbp; movq %rsp, %rbp; movq 0x68(%rdi), %rax; popq %rbp; retq
 *
 * Returns the past-the-end sentinel — `this+0x68` dereferenced.
 */
export function OZVectorShape_end(self: OZVectorShape): OZVectorShape_SegmentNode {
  return self.outlineTail;
}

/**
 * `OZVectorShape::isCurveTriangle(PTTriangle const& t)` @0x3035f0  (32 lines)
 *   __ZN13OZVectorShape15isCurveTriangleERK10PTTriangle
 *
 * Linear scan through the curve-triangle array at this+0xc8 (stride 0xa8
 * bytes/element), comparing each entry to `t` via `PTTriangle::operator==`.
 * Short-circuits on the first match. Returns `true` when a match is found,
 * `false` otherwise.
 *
 * Faithful transcription of 0x3035f0..0x30364f:
 *
 *   0x3035fa  movl  0xc0(%rdi), %r15d           ; n = this.curveTriCount
 *   0x303601  testq %r15, %r15
 *   0x303604  je    0x303643                    ; n == 0 -> return false
 *   0x303609  movq  0xc8(%rdi), %r14            ; p = this.curveTris
 *   0x303610  decq  %r15                        ; remaining = n - 1  (loop counter)
 *
 *   loop @0x303620:
 *     0x303620  movq  %r14, %rdi                ; arg1 = current triangle
 *     0x303623  movq  %rbx, %rsi                ; arg2 = &t
 *     0x303626  call  PTTriangle::operator==(PTTriangle const&) const
 *     0x30362b  subq  $0x1, %r15                ; remaining -= 1 (sets CF/OF)
 *     0x30362f  setb  %cl                       ; cl = (remaining < 0)  i.e. loop is done
 *     0x303632  testb %al, %al                  ; al = op== result
 *     0x303634  jne   0x303645                  ; found -> retq with al=1
 *     0x303636  addq  $0xa8, %r14               ; p += stride
 *     0x30363d  testb %cl, %cl
 *     0x30363f  je    0x303620                  ; !done -> continue
 *     0x303641  jmp   0x303645                  ; done, no match — but al is stale (0 from setne? no, from op== => 0)
 *
 *   0x303643  xorl %eax, %eax                   ; n==0 fast return -> al=0
 *   0x303645  ...  return al
 *
 * The subtlety: the exit at 0x303641 (`done, no match`) returns `%al` which
 * carries the LAST `op==` result — which was 0 (no match, hence we kept
 * looping). So the "done, no match" and "n==0" paths both return 0/false;
 * the "found" path returns 1/true. Faithful semantics: `return matches>0`.
 *
 * Verification (from-disasm-derivable): with n=0 the outer test hits
 * 0x303604 -> `xorl %eax, %eax; retq` -> false without calling operator==.
 * With n=3 and no match, operator== is called exactly 3 times, then the
 * loop exits via 0x30363f -> 0x303641 -> 0x303645 with %al = last op==
 * result = 0. With n=3 and a match at index 1, operator== is called
 * twice; the second call returns 1, `testb %al,%al; jne 0x303645` fires
 * with %al = 1.
 */
export function OZVectorShape_isCurveTriangle(
  self: OZVectorShape,
  t: PTTriangle,
): boolean {
  const n = self.curveTriCount;
  if (n === 0) {
    // @0x303604 `je 0x303643 -> xorl %eax, %eax; retq`
    return false;
  }
  const tris = self.curveTris;
  // %r15 = n - 1  (loop counter, decremented BEFORE the setb test each iteration).
  // The loop condition `!cl` == `remaining >= 0` == `iterations_remaining > 0`,
  // i.e. we execute exactly `n` iterations (i = 0..n-1) OR exit early on match.
  for (let i = 0; i < n; i++) {
    // %r14 = &tris[i]   (each iteration advances %r14 by 0xa8 bytes).
    const eq = PTTriangle_operator_eq(tris[i], t);
    if (eq) return true;
  }
  return false;
}

// -- Un-transcribed methods (throw-stubs w/ @0xADDR) --

/**
 * `OZVectorShape::OZVectorShape()` [C1 thunk @0x3022f0 -> C2 @0x301740]
 * The C2 primary body (486 lines) does:
 *   - vtable install @0x30175b (vt+0x10)
 *   - self-referencing list-sentinel setup for `paths` (this+0x08..0x18)
 *   - self-referencing list-sentinel setup for the second list (this+0x20..0x28)
 *   - epsilon = 0.0001 seeded at this+0x58 (0x3f1a36e2eb1c432d)
 *   - magic 0x1400000000 seeded at this+0x80 and this+0x90
 *   - two `__Znam` allocations: 0x50 bytes at this+0x88, 0xa0 bytes at
 *     a triangle scratch region
 * Details defer to the C2 body decode; throw-stubbed here.
 */
export function OZVectorShape_ctor(): OZVectorShape {
  throw new Error(
    "OZVectorShape::OZVectorShape() @0x301740 (Ozone __ZN13OZVectorShapeC2Ev) not yet transcribed",
  );
}

/**
 * `OZVectorShape::~OZVectorShape()` [D0 @0x302550 / D1/D2 in symbol map]
 *   __ZN13OZVectorShapeD{0,1,2}Ev
 * D0 = D2 + operator delete. D2 tears down both lists and both `__Znam`
 * allocations. Throw-stubbed pending list-node teardown decode.
 */
export function OZVectorShape_dtor(_self: OZVectorShape): void {
  throw new Error(
    "OZVectorShape::~OZVectorShape() @0x302550 (Ozone __ZN13OZVectorShapeD0Ev / D1 / D2) not yet transcribed",
  );
}

/**
 * `OZVectorShape::addPath(OZQuadraticPath*)` @0x302570  (75 lines)
 *   __ZN13OZVectorShape7addPathEP15OZQuadraticPath
 *
 * std::vector<OZQuadraticPath*>::push_back with capacity-doubling realloc.
 * Fast path: `size < capacity` -> store + increment tail; slow path: __Znam
 * a new buffer sized to `max(size+1, capacity*2)` (clamped to
 * `numeric_limits<ptrdiff_t>::max()/8`), memcpy old contents, delete old.
 * Throws `std::__throw_length_error` or `__throw_bad_array_new_length` on
 * overflow. Container plumbing — throw-stub.
 */
export function OZVectorShape_addPath(
  _self: OZVectorShape,
  _path: OZQuadraticPath,
): void {
  throw new Error(
    "OZVectorShape::addPath(OZQuadraticPath*) @0x302570 (Ozone __ZN13OZVectorShape7addPathEP15OZQuadraticPath) not yet transcribed",
  );
}

/**
 * `OZVectorShape::isOnOutline(PCVector2<float> const& p)` @0x302a80  (85 lines)
 *   __ZN13OZVectorShape11isOnOutlineERK9PCVector2IfE
 *
 * Walks the segment std::list at this+0x60..this+0x68. For each segment
 * whose type-tag `*(int*)(seg.data+0) != 1` (line segment):
 *   let a = *(float2*)(seg.data + 0x4)   ; start point
 *   let b = *(float2*)(seg.data + 0xc)   ; end   point
 *   let e = b - a                        ; edge vector
 *   let d = p - a                        ; point-to-start vector
 *   let cross_abs = |e.x*d.y - e.y*d.x|  ; abs-masked with xmm1 = 7fffffff mask
 *   cvtss2sd to double, compare against
 *     eps_d = 0.0001                     ; rip-relative const @Ozone 0x707b58
 *   if cross_abs > eps_d -> not on this segment
 *   let t = dot(d, e)                    ; scalar projection
 *   if t < 0                             -> not on segment (before start)
 *   let e2 = dot(e, e)                   ; edge length squared
 *   if t > e2                            -> not on segment (past end)
 *   -> return true
 * For type-tag == 1 (point marker at seg.data+0x4 first, then also 0xc):
 *   let a = *(float2*)(seg.data+0x4); if (|p.x-a.x|<1e-5f && |p.y-a.y|<1e-5f) return true
 *   let b = *(float2*)(seg.data+0xc); if (|p.x-b.x|<1e-5f && |p.y-b.y|<1e-5f) return true
 *
 * Fast returns false if the list is empty (head==tail check @0x302a88).
 *
 * Constants verified:
 *   xmm1 abs-mask     @Ozone 0x707bc0 : 0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff
 *   xmm2 point-eps    @Ozone 0x708540 : four float32 lanes of 0x3727c5ac ≈ 9.9999997e-6 (~1e-5f)
 *   xmm3 outline-eps  @Ozone 0x707b58 : 0.0001 (double)
 *
 * Throw-stubbed pending segment-node layout decode (the +0x8 next-ptr and
 * +0x10 data-ptr shape needs the tesselate() / compileOutlines() port).
 */
export function OZVectorShape_isOnOutline(
  _self: OZVectorShape,
  _p: { readonly x: number; readonly y: number },
): boolean {
  throw new Error(
    "OZVectorShape::isOnOutline(PCVector2<float> const&) @0x302a80 (Ozone __ZN13OZVectorShape11isOnOutlineERK9PCVector2IfE) not yet transcribed",
  );
}

/**
 * `OZVectorShape::isInteriorPoint(PCVector2<float> const& p)` @0x302f50 (311 lines)
 *   __ZN13OZVectorShape15isInteriorPointERK9PCVector2IfE
 *
 * Point-in-polygon on the tessellated mesh — throw-stubbed.
 */
export function OZVectorShape_isInteriorPoint(
  _self: OZVectorShape,
  _p: { readonly x: number; readonly y: number },
): boolean {
  throw new Error(
    "OZVectorShape::isInteriorPoint(PCVector2<float> const&) @0x302f50 (Ozone __ZN13OZVectorShape15isInteriorPointERK9PCVector2IfE) not yet transcribed",
  );
}

/**
 * `OZVectorShape::isBoundaryTriangle(PTTriangle const*)` @0x303650 (300 lines)
 *   __ZN13OZVectorShape18isBoundaryTriangleEPK10PTTriangle
 *
 * Boundary-triangle classifier — throw-stubbed.
 */
export function OZVectorShape_isBoundaryTriangle(
  _self: OZVectorShape,
  _t: PTTriangle,
): boolean {
  throw new Error(
    "OZVectorShape::isBoundaryTriangle(PTTriangle const*) @0x303650 (Ozone __ZN13OZVectorShape18isBoundaryTriangleEPK10PTTriangle) not yet transcribed",
  );
}

/**
 * `OZVectorShape::compileOutlines()`
 *   __ZN13OZVectorShape15compileOutlinesEv
 * Called from tesselate() to materialize the segment linked list at
 * this+0x60 from the underlying `OZQuadraticPath*` array. Throw-stubbed.
 */
export function OZVectorShape_compileOutlines(_self: OZVectorShape): void {
  throw new Error(
    "OZVectorShape::compileOutlines() @Ozone __ZN13OZVectorShape15compileOutlinesEv not yet transcribed",
  );
}

/**
 * `OZVectorShape::tesselate()`
 *   __ZN13OZVectorShape9tesselateEv
 * Builds the triangle mesh (curve-tris at this+0xc8, boundary-tris in the
 * secondary buffer). Throw-stubbed.
 */
export function OZVectorShape_tesselate(_self: OZVectorShape): void {
  throw new Error(
    "OZVectorShape::tesselate() @Ozone __ZN13OZVectorShape9tesselateEv not yet transcribed",
  );
}

/**
 * `OZVectorShape::findAdjacentTriangle(PTTriangle const*, PCVector2<float> const&,
 *                                      PCVector2<float> const&, int&, int&, int&)`
 *   __ZN13OZVectorShape20findAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_RiS7_S7_
 * Locates the neighbor triangle sharing the edge (p0, p1). Throw-stubbed.
 */
export function OZVectorShape_findAdjacentTriangle(
  _self: OZVectorShape,
  _t: PTTriangle,
  _p0: { readonly x: number; readonly y: number },
  _p1: { readonly x: number; readonly y: number },
  _outI: { value: number },
  _outJ: { value: number },
  _outK: { value: number },
): PTTriangle | null {
  throw new Error(
    "OZVectorShape::findAdjacentTriangle(...) @Ozone __ZN13OZVectorShape20findAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_RiS7_S7_ not yet transcribed",
  );
}

/**
 * `OZVectorShape::subdivideAdjacentTriangle(...)`
 *   __ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE
 * Splits an adjacent triangle at a given interior point. Throw-stubbed.
 */
export function OZVectorShape_subdivideAdjacentTriangle(
  _self: OZVectorShape,
  _t: PTTriangle,
  _p0: { readonly x: number; readonly y: number },
  _p1: { readonly x: number; readonly y: number },
  _p2: { readonly x: number; readonly y: number },
  _outIt: { node: PTTriangle | null },
): void {
  throw new Error(
    "OZVectorShape::subdivideAdjacentTriangle(...) @Ozone __ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE not yet transcribed",
  );
}
