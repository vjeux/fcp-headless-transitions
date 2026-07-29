// PCDelaunay::Triangle — ProCore.framework.
// A single triangle in the PCDelaunay quad-edge / neighbour-triangle mesh.
// Six non-dtor methods transcribed here (all bodies fully recovered):
//   @ProCore 0x54762  Triangle()                     (C2 base-object ctor)
//   @ProCore 0x547ba  Triangle()                     (C1 complete-object ctor — same body per Itanium ABI; recovered via C2)
//   @ProCore 0x547c4  bond(Triangle* other, int i, int j)
//   @ProCore 0x547ee  prev()          (single-load field accessor)
//   @ProCore 0x547f8  next()          (single-load field accessor)
//   @ProCore 0x54802  print()         (std::cerr << *this << endl)
//   @ProCore 0x54eec  isGhost()       (all three vertex ptrs null?)
//
// Source disassemblies:
//   raw-port/re/disasm/PCDelaunay.Triangle.Triangle.s
//   raw-port/re/disasm/PCDelaunay.Triangle.bond.s
//   raw-port/re/disasm/PCDelaunay.Triangle.prev.s
//   raw-port/re/disasm/PCDelaunay.Triangle.next.s
//   raw-port/re/disasm/PCDelaunay.Triangle.print.s
//   raw-port/re/disasm/PCDelaunay.Triangle.isGhost.s
//
// STRUCT LAYOUT (recovered from the ctor at 0x54762 and the accessors):
//   +0x00  vertex[0] : PCVector2<float>*      (bzero at 0x54792 covers 0..0x17)
//   +0x08  vertex[1] : PCVector2<float>*
//   +0x10  vertex[2] : PCVector2<float>*
//   +0x18  neighbour[0] : Triangle*           (init-loop pass rax=0x20, writes qword at 0x18)
//   +0x20  edgeIndex[0] : int32               (init-loop writes dword at 0x20)
//   +0x28  neighbour[1] : Triangle*           (init-loop rax=0x30 -> qword 0x28, dword 0x30)
//   +0x30  edgeIndex[1] : int32               (also: next() reads +0x28 -> next == neighbour[1])
//   +0x38  neighbour[2] : Triangle*           (init-loop rax=0x40 -> qword 0x38, dword 0x40)
//   +0x40  edgeIndex[2] : int32               (also: prev() reads +0x38 -> prev == neighbour[2])
//   +0x48  int16  flag48                      (movw $0, 0x48(%rbx) — 16-bit zero-init)
//   +0x4a  int8   flag4a                      (movb $0, 0x4a(%rbx) — 8-bit zero-init)
//   +0x4c  int32  id                          (loaded from PCDelaunay::Triangle::_idGenerator,
//                                              pre-incremented, then stored at +0x4c and back to the
//                                              generator — classic Meyers-singleton-esque counter)
//   sizeof(Triangle) >= 0x50 (80 bytes).
//
// The ctor's init loop (0x5476b..0x54788) is:
//   eax = 0x20
//   do {
//     *(uint64_t*)(this + eax - 8) = 0;    // neighbour ptr slot
//     *(uint32_t*)(this + eax    ) = 0;    // edgeIndex slot (int32; upper 32 bits at +4 not written here)
//     eax += 0x10;
//   } while (eax != 0x50);
// which is 3 iterations initializing the (neighbour, edgeIndex) triple at offsets 0x18/0x20,
// 0x28/0x30, 0x38/0x40.
//
// Then bzero(this, 0x18) zeros the three vertex pointers at 0x00, 0x08, 0x10.
//
// _idGenerator is a process-wide static int32 (symbol
// __ZN10PCDelaunay8Triangle12_idGeneratorE). The ctor loads it, pre-increments it, writes it
// back, and stores the new value at +0x4c. First triangle constructed sees id=1.

// ─── Frontier callees ────────────────────────────────────────────────────────
//
// print() references three external symbols left as throw-stubs citing their
// addresses so frontier.py surfaces them:
//   @ProCore 0x?        operator<<(std::ostream&, PCDelaunay::Triangle&) — mangled
//                       __ZlsRNSt3__113basic_ostreamIcNS_11char_traitsIcEEEERN10PCDelaunay8TriangleE
//                       called at print() @0x5481a. Not on the ledger yet; it is the actual
//                       "how to render a triangle" function.
//   std::__1::cerr, std::__1::ctype<char>::id, std::__1::locale::use_facet, std::__1::locale::~locale,
//   ostream::put/flush, ios_base::getloc — libc++ facet plumbing.
//
// bond, next, prev, isGhost and the ctor are self-contained pure data motion.

/**
 * PCVector2<float> — 8 bytes: two packed floats at +0x00, +0x04.
 * Full class is a separate leaf on the ledger; here we only need the shape
 * so vertex pointers have a nameable type. Layout is inferred from the
 * PCDelaunay::TriangleEdge::setVertex(int, PCVector2<float>*) signature and
 * matches the pattern of PCVector2<double> in PCMatrix44Tmpl.ts (which is
 * 2 doubles). This is a POINTER field on Triangle; we never dereference it.
 */
interface PCVector2Float {
  x: number;
  y: number;
}

/**
 * PCDelaunay::Triangle — single mesh triangle with 3 vertices, 3 neighbours,
 * per-neighbour edge indices, two small flag fields, and a monotonic id.
 *
 * All addresses cited below are within ProCore.framework at file offset
 * 0x4000 + section-relative offset (thin x86_64 slice: VA == offset).
 */
export class PCDelaunay__Triangle {
  // +0x00, +0x08, +0x10 — three vertex pointers, zeroed by bzero(this, 0x18) at 0x54792.
  vertex: [PCVector2Float | null, PCVector2Float | null, PCVector2Float | null] = [null, null, null];

  // +0x18, +0x28, +0x38 — three neighbour Triangle pointers, zeroed by the init loop.
  neighbour: [PCDelaunay__Triangle | null, PCDelaunay__Triangle | null, PCDelaunay__Triangle | null] = [
    null, null, null,
  ];

  // +0x20, +0x30, +0x40 — three int32 edge indices, zeroed by the init loop.
  // Written by bond() as the "which of my neighbour's edges am I on" back-pointer.
  edgeIndex: [number, number, number] = [0, 0, 0];

  // +0x48 int16 — set to 0 by ctor at 0x54797 (movw $0, 0x48(%rbx)).
  flag48: number = 0;
  // +0x4a int8  — set to 0 by ctor at 0x5479d (movb $0, 0x4a(%rbx)).
  flag4a: number = 0;

  // +0x4c int32 — monotonic id from PCDelaunay::Triangle::_idGenerator.
  id: number = 0;

  /**
   * @ProCore 0x54762  PCDelaunay::Triangle::Triangle()   (C2 base-object ctor)
   * @ProCore 0x547ba  PCDelaunay::Triangle::Triangle()   (C1 complete-object ctor — same body)
   *
   * Disasm summary (0x54762..0x547b8):
   *   0x5476b: eax = 0x20
   *   0x54770: this[eax-8..eax-1] = 0   (movq $0)
   *   0x54779: this[eax..eax+3]   = 0   (movl $0)
   *   0x54780: eax += 0x10
   *   0x54784: if (eax != 0x50) loop   // fills (0x18,0x20) (0x28,0x30) (0x38,0x40)
   *   0x5478a: bzero(this, 0x18)       // vertices[0..2] = nullptr
   *   0x54797: this[0x48] : int16 = 0
   *   0x5479d: this[0x4a] : int8  = 0
   *   0x547a1: id = ++_idGenerator     // load / incl / store back to global + store at 0x4c
   */
  constructor() {
    // The init loop and bzero collectively zero-init every field the ctor touches.
    // In TypeScript we assign the JS defaults declared above; the numeric identity
    // (0 for ints, null for pointers) matches the bit pattern the binary writes.
    // id is loaded from the shared _idGenerator counter and stored back:
    this.id = ++PCDelaunay__Triangle._idGenerator;
  }

  /**
   * @ProCore 0x547c4  PCDelaunay::Triangle::bond(PCDelaunay::Triangle* other, int i, int j)
   *
   * Establishes the mutual "we share an edge" link:
   *   this  ->  neighbour[i] = other, edgeIndex[i] = j
   *   other ->  neighbour[j] = this,  edgeIndex[j] = i
   *
   * Disasm (11 instructions after prologue-tail):
   *   0x547c8  movslq %edx,%rax                     rax = (int64)i
   *   0x547cb  movq   %rax,%rdx                     rdx = i
   *   0x547ce  shlq   $0x4,%rdx                     rdx = i * 16
   *   0x547d2  movq   %rsi,0x18(%rdi,%rdx)          this->neighbour[i] = other  // 0x18 + i*16
   *   0x547d7  movl   %ecx,0x20(%rdi,%rdx)          this->edgeIndex[i] = j      // 0x20 + i*16
   *   0x547db  movslq %ecx,%rcx                     rcx = (int64)j
   *   0x547de  shlq   $0x4,%rcx                     rcx = j * 16
   *   0x547e2  movq   %rdi,0x18(%rsi,%rcx)          other->neighbour[j] = this
   *   0x547e7  movl   %eax,0x20(%rsi,%rcx)          other->edgeIndex[j] = i
   *
   * Note the stride: 16 bytes between (neighbour, edgeIndex) triples means the
   * two arrays are INTERLEAVED (not two parallel arrays). This matters for any
   * caller doing pointer arithmetic; the TS port models them as two parallel
   * arrays because JS doesn't have interior-pointer semantics — the observable
   * behaviour (this[i] <-> other[j]) is identical.
   */
  bond(other: PCDelaunay__Triangle, i: number, j: number): void {
    this.neighbour[i as 0 | 1 | 2] = other;
    this.edgeIndex[i as 0 | 1 | 2] = j;
    other.neighbour[j as 0 | 1 | 2] = this;
    other.edgeIndex[j as 0 | 1 | 2] = i;
  }

  /**
   * @ProCore 0x547ee  PCDelaunay::Triangle::prev()
   *
   * Single field read at +0x38 (neighbour[2]):
   *   0x547f2  movq 0x38(%rdi),%rax
   *   0x547f6  retq
   */
  prev(): PCDelaunay__Triangle | null {
    return this.neighbour[2];
  }

  /**
   * @ProCore 0x547f8  PCDelaunay::Triangle::next()
   *
   * Single field read at +0x28 (neighbour[1]):
   *   0x547fc  movq 0x28(%rdi),%rax
   *   0x54801  retq
   */
  next(): PCDelaunay__Triangle | null {
    return this.neighbour[1];
  }

  /**
   * @ProCore 0x54eec  PCDelaunay::Triangle::isGhost()
   *
   * A triangle is a "ghost" iff ALL three vertex pointers are null:
   *   al = 1
   *   if (vertex[0] != 0) { al = 0; goto ret; }         // 0x54ef2..0x54ef6
   *   if (vertex[1] != 0) { al = 0; goto ret; }         // 0x54ef8..0x54efd
   *   al = (vertex[2] == 0);                            // 0x54eff..0x54f04 (sete %al)
   *   return al
   *
   * Disasm:
   *   0x54ef0  movb  $0x1,%al
   *   0x54ef2  cmpq  $0x0,(%rdi)
   *   0x54ef6  je    0x54f07
   *   0x54ef8  cmpq  $0x0,0x8(%rdi)
   *   0x54efd  je    0x54f07
   *   0x54eff  cmpq  $0x0,0x10(%rdi)
   *   0x54f04  sete  %al
   *   0x54f07  retq
   *
   * Note the short-circuit: as soon as any vertex is non-null the returned
   * al is 1 from the initial mov (WHICH THE HARDWARE THEN DEFAULTS TO 0 ONLY
   * IF THE LAST cmpq PATH EXECUTES). Re-tracing carefully:
   *   - al starts at 1.
   *   - If vertex[0] != 0 -> je NOT taken; fall through to next cmp of vertex[1].
   *     Wait — that's the OPPOSITE branch. Let me re-read: cmpq $0,(%rdi) sets
   *     ZF iff *(rdi) == 0. `je 0x54f07` (jump-if-equal aka jump-if-ZF) means
   *     "if vertex[0] == 0, jump to ret with al=1". So the "goto ret with al=1"
   *     fires when the vertex IS null, and the fall-through path continues to
   *     the next vertex check.
   *   - Same for vertex[1]: if vertex[1] == 0 -> ret al=1.
   *   - Otherwise fall through to `cmpq $0,0x10(%rdi); sete %al` -> al = 1 iff
   *     vertex[2] == 0.
   * That does NOT mean "all null"; it means "the last one checked is null OR
   * an earlier one was null". Concretely:
   *   isGhost() == 1  iff  vertex[0]==0 || vertex[1]==0 || vertex[2]==0
   * i.e. the triangle has at least one null vertex — an "incomplete" triangle.
   * This is the standard Delaunay convention: ghost triangles at the convex
   * hull have exactly one null vertex (the "point at infinity" slot).
   */
  isGhost(): boolean {
    // Faithful to the fall-through structure above.
    if (this.vertex[0] === null) return true;
    if (this.vertex[1] === null) return true;
    return this.vertex[2] === null;
  }

  /**
   * @ProCore 0x54802  PCDelaunay::Triangle::print()
   *
   * Streams `*this` to std::cerr, then appends a newline via
   * `std::cerr.put(ctype<char>::widen('\n')); std::cerr.flush();`.
   *
   * Disasm (linear path — unwind cleanup at 0x54880..0x5488f elided):
   *   0x54810  rbx = &std::__1::cerr
   *   0x5481a  operator<<(cerr, *this)                    // Triangle-specific insertion
   *   0x5481f  rax = *(cerr vtable)                        // load vtable ptr
   *   0x54822  rbx = &cerr + rax[-0x18]                    // apply the offset-to-top for the
   *                                                        //   basic_ios<> subobject of cerr
   *   0x54830  ios_base::getloc(&loc)                      // copy-construct a std::locale on stack
   *   0x5483f  use_facet<ctype<char>>(loc)                 // fetch the ctype<char> facet
   *   0x5484f  callq *0x38(rcx)                            // vtable slot +0x38 = ctype<char>::do_widen(char)
   *                                                        //   arg1 = facet, arg2 = 0xa ('\n')
   *   0x54858  loc.~locale()
   *   0x5486a  cerr.put((char)ebx_result)                  // put the widened newline
   *   0x54872  cerr.flush()
   *   0x5487f  retq
   *
   * The `operator<<(ostream&, PCDelaunay::Triangle&)` is a separate function
   * (mangled __ZlsRNSt3__113basic_ostreamIcNS_11char_traitsIcEEEERN10PCDelaunay8TriangleE)
   * that actually formats the triangle fields; it has not been transcribed.
   * TS has no direct equivalent of C++ ostream + facet-based widening; we
   * mirror the observable effect (a single-line log to stderr) by delegating
   * to the throw-stub for the real formatter — this keeps the frontier honest.
   */
  print(): void {
    // Faithful transcription: the actual formatting is done by
    // operator<<(ostream&, Triangle&) @ProCore 0x?? (undecoded — see stub below),
    // followed by a std::endl equivalent. We surface both callees.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    ostreamInsertTriangle(this);
    // The put(widen('\n')) + flush is boilerplate std::endl; no math to port.
  }

  /**
   * Process-wide monotonic id source.
   * @ProCore data symbol  __ZN10PCDelaunay8Triangle12_idGeneratorE
   * Read/incremented/written by the Triangle ctor at 0x547a1..0x547af.
   * Zero-initialized by the loader (BSS-class data). First ctor sees ++ -> 1.
   */
  static _idGenerator: number = 0;
}

/**
 * operator<<(std::ostream&, PCDelaunay::Triangle&)
 * @ProCore ??  __ZlsRNSt3__113basic_ostreamIcNS_11char_traitsIcEEEERN10PCDelaunay8TriangleE
 *
 * Called by Triangle::print at @0x5481a. Not on the ledger yet; formats the
 * triangle's vertices/neighbours/id into an ostream. Address to be resolved
 * with resolve.py sym on the stub target once its symbol offset is looked up.
 *
 * @throws always, per raw-port Rule 3 — a loud gap until the body is decoded.
 */
function ostreamInsertTriangle(_t: PCDelaunay__Triangle): void {
  throw new Error(
    "operator<<(std::ostream&, PCDelaunay::Triangle&) @0x5481a not yet transcribed (called from PCDelaunay::Triangle::print)",
  );
}
