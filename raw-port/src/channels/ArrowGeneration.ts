// ArrowGeneration.ts — Ozone ArrowGeneration: geometry generator for the
// velocity-view arrow overlay. Builds a 32-slot ring of "arrow vertex"
// entries (OZVelocityViewArrowVertex) and drives triangle emission for
// arrow shafts + heads. This TS file transcribes:
//
//   @0x3fc540  ArrowGeneration::createRing(float, float)   — HEAVY: SIMD-per-lane
//                                                             sincos + std::vector
//                                                             realloc/push_back
//                                                             machinery. Throw-stubbed
//                                                             citing all addrs.
//   @0x3fc740  ArrowGeneration::previousIndexInRing(int)   — FULLY PORTED (9 lines
//                                                             of asm, pure i32 math).
//   @0x3fc760  ArrowGeneration::bestMatchingIndexOrInsert(vector&, vertex&)
//                                                             — HEAVY: linear scan
//                                                             through the input vector
//                                                             + push_back on miss.
//                                                             Throw-stubbed.
//   @0x3fc930  ArrowGeneration::addTriangle(vec&, vec<uint>&, v0, v1, v2)
//                                                             — VERY HEAVY (588 lines
//                                                             of asm): three
//                                                             bestMatchingIndexOrInsert
//                                                             calls interleaved with
//                                                             vector<uint>::push_back.
//                                                             Throw-stubbed.
//
// Rationale for the partial port: previousIndexInRing is a self-contained
// ring-index decrement (return (i-1) mod 32 as an UNSIGNED-carry-clamp). The
// other three methods are heavy libc++ std::vector<> internal choreography
// (capacity/end pointer arithmetic, __split_buffer copy loops, __rec throw
// paths, alignment padding). Faithfully transcribing them requires modeling
// the vector-of-OZVelocityViewArrowVertex ABI (per-element stride is 0x20
// bytes based on the `addq $0x20, %r12` in createRing), which in turn needs
// the OZVelocityViewArrowVertex layout — none of which is yet decoded. Per
// DECODE-DON'T-FIT, they are throw-stubbed with @-cited call sites so the
// frontier surfaces them cleanly.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice).
// Disasm saved: raw-port/re/disasm/ArrowGeneration.*.s
//
// Undecoded frontier (each throw-stubbed with the callee's addr):
//   ___sincosf_stret          @Ozone stub 0x6dfd32 (called from createRing @0x3fc5b6)
//   std::vector<OZVelocityViewArrowVertex>::__throw_length_error /
//     __allocate / __split_buffer machinery         @Ozone (createRing internals)
//   OZVelocityViewArrowVertex layout (per-element 0x20 bytes)
//   the constant pool at 0x3fc5a2/@0x3fc5aa (two doubles multiplied into the
//     `i * 2π/32` step used by the sincos loop — the raw bytes require a
//     proper VA→file-offset resolution not yet available in resolve.py)
//
// Numerics: previousIndexInRing is pure signed-i32 subtract + unsigned-compare
// cmov (asm cmovael → "conditional move if above-or-equal, i.e. CF==0"). The
// pre-decrement `subl $1, %edi` sets CF iff edi was 0 (unsigned underflow);
// on CF==0 the cmovael copies edi (the decremented value) into eax which
// was pre-loaded with 0x1f; on CF==1 (only when input was 0) eax stays 0x1f.
// Result: input 0 → 0x1f (=31); any other int → input-1 (unsigned).

/** OZVelocityViewArrowVertex — undecoded per-element vertex struct. From
 *  createRing's `addq $0x20, %r12` (@0x3fc58b) each element occupies exactly
 *  0x20 = 32 bytes. Layout not yet extracted. */
export interface OZVelocityViewArrowVertex {}

/** A minimal std::vector<T> facade. Modeling the exact libc++ ABI (data +
 *  end + end_of_capacity pointers) is not necessary at this layer — the
 *  three methods that manipulate the vector are throw-stubbed. */
export type Vector<T> = { readonly items: T[] };

/** ArrowGeneration — a pure algorithmic object with no visible instance
 *  state accessed by the four decoded methods (all their state lives in
 *  the passed-in vector<> arguments or in the returned ring struct built
 *  by createRing at *rdi). */
export class ArrowGeneration {
  /**
   * ArrowGeneration::createRing(float radius, float z) @0x3fc540.
   *
   * Builds a ring of 32 vertices (evenly spaced around a circle in the XY
   * plane at height `z`, radius `radius`) into an output vector whose 3
   * libc++ pointer slots are the first argument (return-slot in %rdi).
   *
   * Body outline (see raw-port/re/disasm/ArrowGeneration.createRing.s):
   *
   *   @0x3fc540..@0x3fc55f  prologue + zero output-vector's 3 pointer slots
   *                          via `xorps xmm1,xmm1 ; movups xmm1,(%rdi) ;
   *                          movq $0, 0x10(%rdi)` (data=end=cap=nullptr).
   *   @0x3fc567..@0x3fc56b  broadcast the (x,z) input in %xmm0 via
   *                          `movsldup` → xmm0 = {x, x, ?, ?}; save
   *                          xmm1 (z-arg) at -0x80(%rbp).
   *   @0x3fc57a..@0x3fc6a8  MAIN LOOP: i ∈ {0, 2, 4, …, 62} (steps of 2
   *                          because two vertices per iteration — inner
   *                          angle + outer angle):
   *                            angle = (double)i × const1 × const2
   *                                    (constants are ring-radian steps —
   *                                    the two multiplies at @0x3fc5a2 and
   *                                    @0x3fc5aa look like i × (1/32) × 2π)
   *                            cvtsd2ss → sincosf_stret(angleF)  @0x3fc5b6
   *                              → returns {sinf, cosf} packed in xmm0.
   *                            SIMD-lane-shuffle to build the two 16-byte
   *                            vertex payloads (position + tangent + z).
   *                            When capacity is insufficient, grows the
   *                            vector via std::__split_buffer<> — the whole
   *                            @0x3fc5dc..@0x3fc6a3 sub-block is
   *                            libc++'s vector reallocation dance.
   *                            When capacity is sufficient (r12<r15 branch
   *                            @0x3fc5d7..@0x3fc580), stores the two 16B
   *                            payloads via `movaps` at (%r12) and 0x10(%r12).
   *   @0x3fc6a8..@0x3fc6c6  epilogue / throw-length-error tail.
   *
   * This is ~90 lines of libc++ vector-realloc glue interleaved with the
   * sincosf-based ring generation. Both the OZVelocityViewArrowVertex
   * struct layout and the two double constants (VA @0x3fc5a2 and @0x3fc5aa)
   * are needed for a faithful transcription; neither is decoded yet. Left
   * as a throw-stub citing the entry addr and each frontier callee.
   */
  createRing(_radius: number, _z: number, _outVec: Vector<OZVelocityViewArrowVertex>): void {
    throw new Error(
      "ArrowGeneration::createRing @Ozone 0x3fc540 — 32-slot sincos ring builder using libc++ std::vector<OZVelocityViewArrowVertex> reallocation + ___sincosf_stret @0x3fc5b6 stub 0x6dfd32; per-element stride 0x20 undecoded (OZVelocityViewArrowVertex layout); ring-step constants at @0x3fc5a2/@0x3fc5aa require VA→file-offset resolution — not yet transcribed",
    );
  }

  /**
   * ArrowGeneration::previousIndexInRing(int i) @0x3fc740.
   *
   *   @0x3fc740 pushq %rbp
   *   @0x3fc741 movq  %rsp, %rbp
   *   @0x3fc744 subl  $0x1, %edi          ; edi = i - 1 (i32 sub, sets CF)
   *   @0x3fc747 movl  $0x1f, %eax         ; default = 31
   *   @0x3fc74c cmovael %edi, %eax        ; if (CF == 0) eax = edi
   *   @0x3fc74f popq  %rbp
   *   @0x3fc750 retq
   *
   * `subl` sets CF only on UNSIGNED underflow (i.e. when i == 0). For any
   * other input the `cmovae` picks the decremented value; for i == 0 it
   * leaves eax at 0x1f (=31). So the effect is:
   *   i == 0                 →  31
   *   i in [1, 2^32-1]        →  i - 1  (interpreted as signed i32 back
   *                                       into the return; both C and JS
   *                                       agree since the domain is small).
   * The C++ signature is `int`, so for i < 0 (e.g. -5), the `subl` also
   * doesn't underflow-CF (unsigned view: -5 as u32 = 0xfffffffb, minus 1 =
   * 0xfffffffa, no borrow) and the result is i-1 as signed. But the
   * "previous index in a 32-slot ring" semantics only make sense for
   * i in [0, 31]; other values just faithfully return i-1 (or 31 for 0).
   *
   * Note the ring size 32 is hard-baked as the immediate `$0x1f` (=31 =
   * 32-1). This confirms the ring modeled here is 32-slot (matches the
   * cmpl $0x40 loop-bound in createRing — 0x40 = 64 = 2 × 32 vertices).
   */
  previousIndexInRing(i: number): number {
    // @0x3fc744  subl $1, %edi → edi = (i - 1) as i32.
    const dec = (i - 1) | 0;
    // @0x3fc74c  cmovael %edi, %eax  where eax was pre-loaded with 0x1f.
    // `cmovae` fires when CF==0, i.e. when the subtract did NOT unsigned-
    // underflow. `(i - 1) as unsigned` underflows iff `i` viewed as u32
    // was 0. So the CF==1 (skip cmov, keep 0x1f) case is exactly i==0
    // (u32-viewed). For any other u32 value of i, dec wins.
    // JS `i | 0` keeps signed-i32 semantics, but the underflow condition
    // reduces to a plain `i === 0` compare regardless of sign because
    // 0 is the only u32 value whose u32-decrement borrows.
    if ((i | 0) === 0) {
      // @0x3fc747 movl $0x1f, %eax ; @0x3fc74c cmovae skipped ; return 31.
      return 0x1f | 0;
    }
    return dec;
  }

  /**
   * ArrowGeneration::bestMatchingIndexOrInsert(vector<OZVelocityViewArrowVertex>&,
   *                                            OZVelocityViewArrowVertex const&) @0x3fc760.
   *
   * Linear-scans the vector looking for an existing entry that is
   * component-wise "close enough" to the passed vertex (some tolerance
   * threshold — undecoded exact form) and returns its index; if none
   * matches, push_back's the new vertex and returns the new (last) index.
   *
   * The 128 lines of asm break down as:
   *   - vector<>::begin/end pointer load
   *   - loop over 0x20-byte strides, comparing SIMD-packed components
   *   - if match: return index (data - begin) / 0x20
   *   - else: check capacity; if full, reallocate via __split_buffer
   *   - store the new vertex, bump end pointer, return the new index
   *
   * A faithful transcription needs the OZVelocityViewArrowVertex layout
   * AND the matching predicate — both undecoded. Throw-stub citing the
   * entry addr.
   */
  bestMatchingIndexOrInsert(
    _vec: Vector<OZVelocityViewArrowVertex>,
    _vert: OZVelocityViewArrowVertex,
  ): number {
    throw new Error(
      "ArrowGeneration::bestMatchingIndexOrInsert @Ozone 0x3fc760 — 128-line linear-scan-or-push_back over vector<OZVelocityViewArrowVertex>; per-element predicate + OZVelocityViewArrowVertex layout undecoded, not yet transcribed",
    );
  }

  /**
   * ArrowGeneration::addTriangle(vector<Vertex>&, vector<uint>&,
   *                              Vertex v0, Vertex v1, Vertex v2) @0x3fc930.
   *
   * Emits one triangle by:
   *   1. Calling bestMatchingIndexOrInsert(vertexVec, v0) → i0
   *   2. Calling bestMatchingIndexOrInsert(vertexVec, v1) → i1
   *   3. Calling bestMatchingIndexOrInsert(vertexVec, v2) → i2
   *   4. push_back'ing i0, i1, i2 into indexVec.
   *
   * All three vertex operations may realloc the vertex vector; each
   * push_back onto the index vector may realloc the index vector. The
   * asm is 588 lines of libc++ machinery interleaved with the three
   * bestMatchingIndexOrInsert callq's. Faithful transcription requires
   * bestMatchingIndexOrInsert to be ported first (which itself requires
   * the OZVelocityViewArrowVertex layout — see above). Throw-stub.
   */
  addTriangle(
    _vertexVec: Vector<OZVelocityViewArrowVertex>,
    _indexVec: Vector<number>,
    _v0: OZVelocityViewArrowVertex,
    _v1: OZVelocityViewArrowVertex,
    _v2: OZVelocityViewArrowVertex,
  ): void {
    throw new Error(
      "ArrowGeneration::addTriangle @Ozone 0x3fc930 — 588-line triangle emitter (3× bestMatchingIndexOrInsert + push_back into index vector) over libc++ vectors; bestMatchingIndexOrInsert dependency + OZVelocityViewArrowVertex layout undecoded, not yet transcribed",
    );
  }
}
