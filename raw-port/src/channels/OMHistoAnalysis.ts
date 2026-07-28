// OMHistoAnalysis.ts — Flexo/OM histogram-analysis result aggregate.
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Four symbols observed:
//   @Flexo 0x000000000007bb50  OMHistoAnalysis::~OMHistoAnalysis()  [D1 — complete-object dtor]
//   @Flexo 0x0000000000080100  OMHistoAnalysis::~OMHistoAnalysis()  [D2 — base-object dtor]
//   @Flexo 0x0000000000080290  OMHistoAnalysis::~OMHistoAnalysis()  [D0 — deleting dtor]
//   @Flexo 0x000000000111cac0  OMHistoAnalysis::OMHistoAnalysis(OMHistoAnalysis const&)  [C2 base copy ctor]
// (No default ctor and no ordinary D0 alias for D1 — clang emitted the D2 body once and had D1
//  jmp-thunk to it; D0 wraps D2 with `::operator delete(this)` in the Itanium standard shape.)
//
// STRUCT LAYOUT (recovered from the copy ctor's stores + D2's field-by-field cleanup — the
// destructor's ordered `movq …(%rbx),%rdi ; test/je ; callq __ZdlPv` pattern reveals every
// std::vector's begin-pointer slot; each `__throw_length_error` arm in the copy ctor's
// __except path reveals the ELEMENT TYPE of each vector by mangling):
//
//   OFFSET   FIELD                                              ELEMENT / SIZE
//   +0x000   vptr                                               (Flexo vtable @0x18F1F18)
//   +0x008   vecHistoRangeA.__begin                             std::vector<HistoRange>  (elt=28 bytes)
//   +0x010   vecHistoRangeA.__end
//   +0x018   vecHistoRangeA.__cap
//   +0x020   vecHistoRangeB.__begin                             std::vector<HistoRange>
//   +0x028   vecHistoRangeB.__end
//   +0x030   vecHistoRangeB.__cap
//   +0x038   vecHistoRangeC.__begin                             std::vector<HistoRange>
//   +0x040   vecHistoRangeC.__end
//   +0x048   vecHistoRangeC.__cap
//   +0x050…0x070   inlineStruct0                                20 bytes (movups pair + u32 tail)
//                  {i128 xmm0 @+0x50, i128 xmm1 @+0x60, u32 @+0x70}
//   +0x078   vecFloatA.__begin                                  std::vector<float>
//   +0x080   vecFloatA.__end
//   +0x088   vecFloatA.__cap
//   +0x090…0x0AC   inlineStruct1                                28 bytes packed
//                  (two overlapping movups @+0x90 and @+0x9C: xmm0 covers +0x90..+0xA0, xmm1
//                   covers +0x9C..+0xAC → 28-byte packed record with 4-byte overlap at +0x9C).
//                   Compiler chose to memcpy 32 bytes via two 16-byte moves.
//   +0x0B0   vecFloatB.__begin                                  std::vector<float>
//   +0x0B8   vecFloatB.__end
//   +0x0C0   vecFloatB.__cap
//   +0x0C8   vecFloatC.__begin                                  std::vector<float>
//   +0x0D0   vecFloatC.__end
//   +0x0D8   vecFloatC.__cap
//   +0x0E0   vecFloatD.__begin                                  std::vector<float>
//   +0x0E8   vecFloatD.__end
//   +0x0F0   vecFloatD.__cap
//   +0x0F8   vecFloatE.__begin                                  std::vector<float>
//   +0x100   vecFloatE.__end
//   +0x108   vecFloatE.__cap
//   +0x110   vecOMRgbChar.__begin                               std::vector<OMRgbChar> (elt=16 bytes)
//   +0x118   vecOMRgbChar.__end
//   +0x120   vecOMRgbChar.__cap
//   +0x128   vecFloatF.__begin                                  std::vector<float>
//   +0x130   vecFloatF.__end
//   +0x138   vecFloatF.__cap
//   +0x140   vecInt.__begin                                     std::vector<int>
//   +0x148   vecInt.__end
//   +0x150   vecInt.__cap
//   +0x158   vecFloatG.__begin                                  std::vector<float>
//   +0x160   vecFloatG.__end
//   +0x168   vecFloatG.__cap
//   +0x170   vecVec2i.__begin                                   std::vector<Vec2i> (elt=8 bytes)
//   +0x178   vecVec2i.__end
//   +0x180   vecVec2i.__cap
//   +0x188…0x198   inlineStruct2                                20 bytes packed
//                  {i128 xmm0 @+0x188, u32 @+0x198}
//
//   Total sizeof(OMHistoAnalysis) = 0x19C = 412 bytes (last field at +0x198 is a u32).
//
// ELEMENT SIZE PROOFS (from the copy ctor's overflow check `sarq $2,%rax ; imulq $magic,%rax`
// pattern — this is the compiler's canonical "byte-count / elt-size" division-by-invariant
// implementation used before std::vector<>::__throw_length_error):
//   +0x008/+0x020/+0x038  →  sarq $2; imulq 0x6DB6DB6DB6DB6DB7  →  divide-by-28 (HistoRange)
//   +0x110                →  no sarq, byteCount used verbatim → element size = 1, but the
//                             throw target is `vector<OMRgbChar>::__throw_length_error` and
//                             the actual copy loop @+0x111CF20 reads 16-byte records
//                             (movzwl@+8, movzbl@+10, +0x10 stride) with a vptr installed at
//                             each element start — so OMRgbChar is a 16-byte polymorphic
//                             object with layout {vptr@0, u16@+8, u8@+10}. The vector uses
//                             per-element construction, not memcpy, hence the special loop.
//   +0x170                →  simple `subq %r15,%r12` byte-count, no elt-size division at the
//                             throw check ⇒ signed check only, meaning element size divides
//                             a native pointer alignment; the field-name mangling
//                             `vector<Vec2i>` confirms 8-byte elements (two int32).
//   All other vectors     →  simple `subq` size (no division) → memcpy'd verbatim → element
//                             size = sizeof(float) = 4 or sizeof(int) = 4.
//
// FRONTIER (undecoded — throwing stubs / opaque types):
//   - HistoRange (28-byte POD; used in vectors A/B/C).
//       Mangling: `10HistoRange` (Itanium). Layout unknown; treated as opaque byte record.
//   - OMRgbChar (16-byte polymorphic).
//       Copy loop @0x111CF20 reveals per-element construction (see above): {vptr@0, u16@+8,
//       u8@+0xA}. Full vtable and remaining 4 bytes unknown from this method.
//   - Vec2i (8 bytes = 2×int32).
//   - The Flexo vtable @0x18F1F18 — not walked here (vtable.py timed out on Flexo).
//   - std::vector<>::__throw_length_error [abi:nqe210106] variants — libc++ exception
//       machinery. Modeled as raising stubs.
//   - __Znwm (operator new), _memcpy, __ZdlPv (operator delete), __Unwind_Resume, and
//       __exception_guard_exceptions dtor — libc++/libstdc++/libunwind primitives, not
//       ported. Modeled as raising stubs.
//
// The COPY CONSTRUCTOR is a 559-line clang-inline expansion of
//   for each vector member v of *this:
//       new(&v) std::vector<T>();                                   // zero begin/end/cap
//       byteCount = src.v.__end - src.v.__begin;
//       if (byteCount != 0) {
//           if (byteCount / sizeof(T) > MAX_SIZE) __throw_length_error();
//           this->v.__begin = __Znwm(byteCount);                    // operator new
//           this->v.__end   = this->v.__begin;
//           this->v.__cap   = this->v.__begin + byteCount;
//           memcpy(this->v.__begin, src.v.__begin, byteCount);      // OR per-element loop
//           this->v.__end   = this->v.__cap;                        // (for OMRgbChar)
//       }
//   copy each inline scalar/POD block via movups.
//   All allocations are wrapped in a nested exception-guard chain that rolls back all
//   previously-allocated vectors if any subsequent __Znwm throws.
// A faithful TS transcription requires porting libc++'s std::vector (allocator/exception-
// guard semantics + __throw_length_error) — that is a large infrastructure task that
// dwarfs this class's work. Modeled here as a raising stub with the full documentation
// preserved so a future infra pass can complete it.

/**
 * HistoRange — 28-byte POD used in vecHistoRangeA/B/C. Element size derived from the
 * `sarq $2 ; imulq 0x6DB6DB6DB6DB6DB7` idiom in the copy ctor's overflow guard (see
 * copyctor.docs above; magic constant is the mod-2^64 inverse of 7, so `sarq $2` then
 * multiplying is byte-count / 28).
 *
 * Full field layout not decoded from this file's four methods — the copy ctor uses raw
 * memcpy, so no field offsets are visible here. Left as an opaque nominal type.
 */
export interface HistoRange {
  readonly __histoRange: unique symbol;
}

/**
 * Vec2i — 8-byte pair of int32. Element size 8 confirmed by mangling
 * `_ZNSt3__16vectorI5Vec2i…` and byte-count math (subq alone, no division).
 */
export interface Vec2i {
  x: number; // int32
  y: number; // int32
}

/**
 * OMRgbChar — 16-byte polymorphic record. Layout partially recovered from the OMRgbChar
 * copy loop @0x111CF20..0x111CF3F in the copy ctor:
 *   +0x0   vptr  (installed from RIP-relative 0x7fed8b at 0x111cf16 — points into Flexo
 *                 vtable region; exact vtable address = 0x111CF1D + 0x7FED8B = 0x191BAA8)
 *   +0x8   u16  (movzwl 0x8(%r15),%edx ; movw %dx, 0x8(%rax))
 *   +0xA   u8   (movzbl 0xa(%r15),%edx ; movb %dl, 0xa(%rax))
 *   +0xB..+0x10  UNKNOWN (unused by the copy loop — 5 bytes of padding or reserved fields)
 *
 * Full class not ported here (frontier).
 */
export interface OMRgbChar {
  readonly __omRgbChar: unique symbol;
}

/**
 * ::operator delete(void*) — libc++ __ZdlPv @Flexo __stubs 0x1497404.
 * Called throughout D2 to free every non-null vector begin-pointer, plus tail-called from
 * D0 to release the aggregate. Raising stub — no portable binding.
 */
function operatorDelete(_p: unknown): never {
  throw new Error(
    "::operator delete (__stub __ZdlPv @Flexo 0x1497404) not yet ported — called from OMHistoAnalysis dtors and copy ctor",
  );
}

/**
 * OMHistoAnalysis — 412-byte aggregate of histogram analysis buffers used by Flexo's OM
 * (Optical Media?) pipeline. Contains 13 std::vector members + 3 inline scalar blocks.
 *
 * The default state (as installed by the copy ctor after zeroing but before any src copy)
 * is "all vectors empty (nullptr begin/end/cap)"; TS mirrors this with empty arrays.
 */
export class OMHistoAnalysis {
  // Vectors are modeled as ordinary TS arrays; the C++ layout uses libc++ std::vector
  // (three raw pointers: begin/end/cap) but the byte-level layout is only observable via
  // the copy ctor / dtor. In TS we hold the elements, not the pointer trio.

  /** +0x008..+0x018 — vector<HistoRange> A. */ vecHistoRangeA: HistoRange[] = [];
  /** +0x020..+0x030 — vector<HistoRange> B. */ vecHistoRangeB: HistoRange[] = [];
  /** +0x038..+0x048 — vector<HistoRange> C. */ vecHistoRangeC: HistoRange[] = [];

  /**
   * +0x050..+0x070 — 32 bytes of inline scalar state copied via two movups + one movl in
   * the copy ctor @0x111CC49..0x111CC5E. Layout not further decoded from the four
   * methods. Modeled as a fixed-length 20-byte buffer (Uint8Array) so provenance is
   * preserved without inventing field names.
   */
  inlineStruct0: Uint8Array = new Uint8Array(0x24); // covers +0x50..+0x74 (u32 tail at +0x70)

  /** +0x078..+0x088 — vector<float>. */ vecFloatA: number[] = [];

  /**
   * +0x090..+0x0AC — 28 bytes of inline scalar state copied via two overlapping movups
   * (xmm0 @+0x90 covers +0x90..+0xA0, xmm1 @+0x9C covers +0x9C..+0xAC). The 4-byte overlap
   * at +0x9C..+0xA0 is just how the compiler chose to emit two aligned-friendly 16-byte
   * stores for a 28-byte packed record. Modeled as a fixed-length byte buffer.
   */
  inlineStruct1: Uint8Array = new Uint8Array(0x1c); // 28 bytes

  /** +0x0B0..+0x0C0 — vector<float>. */ vecFloatB: number[] = [];
  /** +0x0C8..+0x0D8 — vector<float>. */ vecFloatC: number[] = [];
  /** +0x0E0..+0x0F0 — vector<float>. */ vecFloatD: number[] = [];
  /** +0x0F8..+0x108 — vector<float>. */ vecFloatE: number[] = [];

  /** +0x110..+0x120 — vector<OMRgbChar>. Per-element construction, not memcpy. */
  vecOMRgbChar: OMRgbChar[] = [];

  /** +0x128..+0x138 — vector<float>. */ vecFloatF: number[] = [];
  /** +0x140..+0x150 — vector<int>. */ vecInt: number[] = [];
  /** +0x158..+0x168 — vector<float>. */ vecFloatG: number[] = [];
  /** +0x170..+0x180 — vector<Vec2i>. */ vecVec2i: Vec2i[] = [];

  /**
   * +0x188..+0x19C — 20 bytes of inline scalar state copied via movups @+0x188 (16 bytes)
   * + movl @+0x198 (u32). Modeled as byte buffer.
   */
  inlineStruct2: Uint8Array = new Uint8Array(0x14); // 20 bytes

  /**
   * OMHistoAnalysis::OMHistoAnalysis(OMHistoAnalysis const&) — @Flexo 0x111CAC0 (C2 base copy).
   *
   * The disassembly is 559 lines: 13 vector allocations (each with an overflow guard, an
   * `__Znwm` allocation, and either a `_memcpy` or a per-element copy loop) chained through
   * an exception-guard-exceptions block that unwinds all previously-allocated vectors if
   * any later allocation throws, plus 3 inline scalar-block copies via movups/movl.
   *
   * A byte-exact port requires standing up:
   *   - a libc++ std::vector<T> equivalent (with __throw_length_error semantics),
   *   - ::operator new (__Znwm) and ::operator delete (__ZdlPv) bindings,
   *   - the exception-guard-exceptions destructor chain,
   *   - a per-element OMRgbChar copy that mirrors the vptr install + u16/u8 field copy.
   *
   * That is a large infrastructure task. Rather than ship a partial copy that silently
   * omits the exception-safety semantics, this method is left as a raising stub citing the
   * full addresses and unblocking a future infrastructure-first pass.
   *
   * The address list below is the exhaustive set of allocation sites the port must eventually
   * cover, in the order the copy ctor visits them:
   *   @0x111CB30  __Znwm  (vecHistoRangeA)         ; @0x111CB50 _memcpy
   *   @0x111CBA8  __Znwm  (vecHistoRangeB)         ; @0x111CBC8 _memcpy
   *   @0x111CC20  __Znwm  (vecHistoRangeC)         ; @0x111CC40 _memcpy
   *   @0x111CC95  __Znwm  (vecFloatA)              ; @0x111CCBB _memcpy
   *   @0x111CD21  __Znwm  (vecFloatB)              ; @0x111CD4A _memcpy
   *   @0x111CD92  __Znwm  (vecFloatC)              ; @0x111CDBB _memcpy
   *   @0x111CE03  __Znwm  (vecFloatD)              ; @0x111CE2C _memcpy
   *   @0x111CE74  __Znwm  (vecFloatE)              ; @0x111CE9D _memcpy
   *   @0x111CEF9  __Znwm  (vecOMRgbChar)           ; per-element loop @0x111CF20..0x111CF3F
   *                                                  installs vptr @0x191BAA8, copies u16 @+8, u8 @+10
   *   @0x111CF84  __Znwm  (vecFloatF)              ; @0x111CFAD _memcpy
   *   @0x111CFF5  __Znwm  (vecInt)                 ; @0x111D01E _memcpy
   *   @0x111D066  __Znwm  (vecFloatG)              ; @0x111D08F _memcpy
   *   @0x111D0D6  __Znwm  (vecVec2i)               ; @0x111D0FF _memcpy
   *   inline copies @0x111CC49..0x111CC5E, @0x111CCC7..0x111CCDE, @0x111D10B..0x111D120.
   */
  static copyFrom(_dst: OMHistoAnalysis, _src: OMHistoAnalysis): never {
    throw new Error(
      "OMHistoAnalysis::OMHistoAnalysis(OMHistoAnalysis const&) @Flexo 0x111CAC0 not yet ported — 559-line copy of 13 std::vector members + 3 inline blocks; requires libc++ std::vector semantics + __throw_length_error/__exception_guard_exceptions infra (see method header for full site list)",
    );
  }

  /**
   * OMHistoAnalysis::~OMHistoAnalysis() — D2 (base-object dtor) @Flexo 0x080100.
   *
   * Full disassembly (100 lines). The body is a canonical clang expansion of
   *   this->__vptr = OMHistoAnalysis's own vtable (@0x18F1F18); // rebind vptr to *this's class
   *   for each std::vector member in REVERSE order:
   *       if (member.__begin != nullptr) {
   *           member.__end = member.__begin;
   *           ::operator delete(member.__begin);
   *       }
   *   // vecOMRgbChar (+0x110) needs a per-element __destroy loop first (each element has a
   *   // virtual dtor), THEN operator-delete its buffer:
   *
   * REVERSE-ORDER FIELD RELEASE (from the actual disasm — the compiler emits dtor cleanups
   * in the REVERSE of ctor init order):
   *   +0x170  vecVec2i.__begin       → operator delete    (@0x080123)
   *   +0x158  vecFloatG.__begin      → operator delete    (@0x08013B)
   *   +0x140  vecInt.__begin         → operator delete    (@0x080153)
   *   +0x128  vecFloatF.__begin      → operator delete    (@0x08016B)
   *   +0x110  vecOMRgbChar:                              (@0x080177..0x0801BF)
   *              foreach elem in [begin..end):  elem->__vptr->[dtor](elem)
   *              then operator delete on the buffer
   *   +0x0F8  vecFloatE.__begin      → operator delete    (@0x0801D0)
   *   +0x0E0  vecFloatD.__begin      → operator delete    (@0x0801E8)
   *   +0x0C8  vecFloatC.__begin      → operator delete    (@0x080200)
   *   +0x0B0  vecFloatB.__begin      → operator delete    (@0x080218)
   *   +0x078  vecFloatA.__begin      → operator delete    (@0x08022D)
   *   +0x038  vecHistoRangeC.__begin → operator delete    (@0x080242)
   *   +0x020  vecHistoRangeB.__begin → operator delete    (@0x080254)
   *   +0x008  vecHistoRangeA.__begin → operator delete    (@0x080266) [TAIL CALL @0x080274]
   *   (The last cleanup is a tail-call `jmp __ZdlPv`, folding the final free into the dtor's
   *    epilogue. If vecHistoRangeA.__begin was already null (@0x080261 je 0x80279), the
   *    tail-call is skipped and a plain retq epilogue @0x080279 runs.)
   *
   * VTABLE REBIND @0x080114:
   *   `leaq 0x1871e04(%rip), %rax ; movq %rax, (%rdi)` — installs the OMHistoAnalysis vtable
   *   pointer BEFORE running any field cleanups. This is the standard clang expansion for a
   *   polymorphic dtor: rebind vptr to the current class's vtable so that any virtual call
   *   during the field-cleanup phase dispatches to this class's overrides rather than a
   *   more-derived subclass's. The RIP-relative computation yields
   *   0x08011E + 0x1871E04 = 0x18F1F22 → adjacent to the vtable head at 0x18F1F18 (offset by
   *   the standard +0x10 for the installed-pointer, i.e. past the RTTI and the top-offset).
   *
   * In the TS port we DO NOT rebind vptr (there is no explicit vtable — TS uses prototype
   * chains) and we DO NOT need to call operator delete on the vector buffers (TS uses GC).
   * The BEHAVIOR that ports is: clear all vector state so subsequent access sees an empty
   * container, matching the C++ post-dtor state (begin==end==cap==nullptr → size()==0).
   *
   * Note that in TS, D2 will normally be reached only from an explicit `_dtor()` call or
   * from D1/D0 wrappers — GC handles the actual reclamation.
   */
  protected _dtorD2(): void {
    // Mirror the reverse-order field release from the disasm. In TS this is functionally a
    // reset-to-default (empty arrays / zeroed buffers) — the C++ operator-delete calls do
    // not have an in-TS analogue but we preserve the ORDER so a future memory-model port
    // can wire real deletes here without re-tracing the asm.
    this.vecVec2i = [];         // @0x080123 — vector<Vec2i>          delete(+0x170)
    this.vecFloatG = [];        // @0x08013B — vector<float>          delete(+0x158)
    this.vecInt = [];           // @0x080153 — vector<int>            delete(+0x140)
    this.vecFloatF = [];        // @0x08016B — vector<float>          delete(+0x128)
    this.vecOMRgbChar = [];     // @0x080177..0x0801BF — polymorphic destroy + delete(+0x110)
    this.vecFloatE = [];        // @0x0801D0 — vector<float>          delete(+0x0F8)
    this.vecFloatD = [];        // @0x0801E8 — vector<float>          delete(+0x0E0)
    this.vecFloatC = [];        // @0x080200 — vector<float>          delete(+0x0C8)
    this.vecFloatB = [];        // @0x080218 — vector<float>          delete(+0x0B0)
    this.vecFloatA = [];        // @0x08022D — vector<float>          delete(+0x078)
    this.vecHistoRangeC = [];   // @0x080242 — vector<HistoRange>     delete(+0x038)
    this.vecHistoRangeB = [];   // @0x080254 — vector<HistoRange>     delete(+0x020)
    this.vecHistoRangeA = [];   // @0x080266 (tail@0x080274) — vector<HistoRange> delete(+0x008)
  }

  /**
   * OMHistoAnalysis::~OMHistoAnalysis() — D1 (complete-object dtor) @Flexo 0x07BB50.
   *
   * Full disassembly (5 instructions):
   *   07bb50  pushq   %rbp
   *   07bb51  movq    %rsp, %rbp
   *   07bb54  popq    %rbp
   *   07bb55  jmp     __ZN15OMHistoAnalysisD2Ev     ; TAIL CALL D2 @0x080100
   *   07bb5a  nopw    (%rax,%rax)
   *
   * Body: pure tail-thunk to D2. D1 exists solely to satisfy the Itanium ABI slot in the
   * vtable (D1 == "base subobject dtor"; D2 == "complete-object dtor" — clang emitted them
   * separately and folded D1 into a jmp).
   */
  protected _dtorD1(): void {
    this._dtorD2();
  }

  /**
   * OMHistoAnalysis::~OMHistoAnalysis() — D0 (deleting dtor) @Flexo 0x080290.
   *
   * Full disassembly (12 instructions):
   *   080290  pushq   %rbp
   *   080291  movq    %rsp, %rbp
   *   080294  pushq   %rbx
   *   080295  pushq   %rax                          ; alloc 8 bytes stack padding
   *   080296  movq    %rdi, %rbx                    ; save this
   *   080299  callq   __ZN15OMHistoAnalysisD2Ev     ; D2(this)
   *   08029e  movq    %rbx, %rdi                    ; rdi = this
   *   0802a1  addq    $0x8, %rsp
   *   0802a5  popq    %rbx
   *   0802a6  popq    %rbp
   *   0802a7  jmp     0x1497404                     ; TAIL CALL __ZdlPv (operator delete)
   *   0802ac  nopl    (%rax)
   *
   * Body: run D2 to release all vector storage, then `::operator delete(this)` to free the
   * containing 412-byte block. The operator delete tail-call is modeled as the raising stub
   * `operatorDelete` (see file frontier note) — invoking D0 in the ported code preserves the
   * demand signal for a real allocator binding.
   */
  protected _dtorD0(): never {
    this._dtorD2();
    operatorDelete(this);
  }
}
