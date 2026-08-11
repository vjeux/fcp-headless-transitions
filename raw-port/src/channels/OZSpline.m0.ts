// OZSpline.m0.ts — OZSpline methods, chunk 0 (indices 0..19 of 137).
// ProChannel.framework/Versions/A/ProChannel  (x86_64 slice; VA==offset since __TEXT@0).
//
// This chunk covers the ctors, dtors, copy, and the small "interpolation/extrapolation" plumbing
// accessors. Faithful port following raw-port/army/PORTING_SPEC.md — every function cites its
// @0xADDR; undecoded branches/callees are throw-stubs citing the address to be resolved. Written
// under the SHARED-class rule (OZSpline listed in claim.py SHARED set) as a chunked companion to
// the existing distilled sampler in OZSpline.ts (which stays unchanged).
//
// ── Struct layout (recovered from ctor @0x2cd78 + dtor @0x2d1e6 + setInterpolation @0x2d614 +
//    getInterpolation @0x2d6da). Every offset cites the instruction that reads/writes it. ────────
//   +0x00 vtable*                                                                          @0x2cd85
//   +0x08 PCSpinLock (dtor calls PCSpinLockD1(rbx+8) @0x2d2c2; lock/unlock @0x2d213/0x2d28e)
//   +0x10 OZVertex** allVerticesBegin   (dtor walks [+0x10, +0x18) freeing each via vtable[1] @0x2d231)
//   +0x18 OZVertex** allVerticesEnd     (dtor uses these to iterate + storage delete @0x2d2ae)
//   +0x20 OZVertex** allVerticesCap
//   +0x28 OZVertex** validVerticesBegin (setInterpolation walks [+0x28, +0x30) @0x2d648..0x2d64c)
//   +0x30 OZVertex** validVerticesEnd
//   +0x38 (zeroed) — likely validVerticesCap                                               @0x2ce05
//   +0x48..+0x60 std::vector<...> begin/end/cap of a THIRD owned buffer
//                (dtor frees +0x58 pointer via `delete` after setting cap to begin @0x2d29c..0x2d2a0)
//   +0x68 (zeroed) — unclear (extrapolation params or count)                               @0x2cdaf
//   +0x70 bool set to 1 by ctor                                                            @0x2ce09
//   +0x78..+0x88 std::vector<...> begin/end/cap of a FOURTH buffer (zeroed @0x2cddd/+0x88 @0x2cde6)
//   +0x90 bool dirty flag (copied byte-for-byte by OZSpline::copy @0x2d315)                 @0x2cdba
//   +0x91 bool "validListInit" (ctor writes 1; copy also forces 1 @0x2d321)                @0x2cdef
//   +0x98 OZInterpolators* (heap-allocated 0x18 bytes via new; owned & deleted by dtor)     @0x2cdd6
//   +0xa0 externalLockManager* (an object whose +0x30 is an OZLock; if null or that field
//         is null, fall back to the internal PCSpinLock at +0x8)                            @0x2cdbd read-back
//   +0xa8 OZSplineState* sp (ctor arg2)                                                    @0x2cdb3
//
// The class object is at least 0xB0 bytes on x86_64 (last write at +0xa8).

import { OZSplineState } from "./OZSplineState.js";

// ── Undecoded external callees — throw with @0xADDR so gate G3/G4 can catch drift. ───────────────

/** OZInterpolators::OZInterpolators() @ProChannel 0x2cdd1 (heap-new'd 0x18-byte object).
 *  Not yet transcribed — see OZInterpolators.ts once the ctor is decoded. */
function newOZInterpolators(): unknown {
  throw new Error("OZInterpolators::OZInterpolators() @ProChannel 0x2cdd1 not yet transcribed");
}

/** OZInterpolators::~OZInterpolators() @ProChannel 0x2d25d (called from OZSpline dtor). */
function deleteOZInterpolators(_p: unknown): void {
  throw new Error("OZInterpolators::~OZInterpolators() @ProChannel 0x2d25d not yet transcribed");
}

/** OZInterpolators::getInterpolator(unsigned int) @ProChannel 0x2d766 — used by getInterpolation
 *  to look up an interpolator by kind and then invoke its virtual `usesTangents()` at vtable+0x40. */
function ozInterpolatorsGetInterpolator(_pool: unknown, _kind: number): unknown {
  throw new Error("OZInterpolators::getInterpolator @ProChannel 0x2d766 not yet transcribed");
}

/** PCSpinLock ctor/dtor/lock/unlock — imported as stubs from libPCore; embedded at +0x8.
 *  Sizeof and internal layout are opaque to this class. Modeled here as an opaque holder. */
class PCSpinLockOpaque {
  // The bytes span +0x8..+0x28 in the parent (dtor takes PCSpinLockD1(rbx+8) with no size cited).
  // Do NOT read or write into this from TS — only pass its identity around.
  private readonly tag = "PCSpinLockOpaque";
  lock(): void {
    throw new Error("PCSpinLock::lock @ProChannel stub 0xacb16 not yet transcribed");
  }
  unlock(): void {
    throw new Error("PCSpinLock::unlock @ProChannel stub 0xacb1c not yet transcribed");
  }
}

/** OZVertex — pointed-to element type of the allVertices/validVertices vectors. Virtual class;
 *  we hold it as an opaque handle here (only ctor-visible ops in this chunk are: vector begin/end
 *  pointer arithmetic and vtable[0xd0]() = "getInterpolation" invoked by OZSpline::getInterpolation
 *  @0x2d709). The real port lives in a future OZVertex.ts. */
export interface OZVertex {
  /** vtable[0xd0] — virtual unsigned int getInterpolation(). @0x2d709 / @0x2d723 */
  __getInterpolation__(): number;
  /** vtable[0xb8] — virtual bool query(unsigned int kind); called from setInterpolation @0x2d65d
   *  as `vertex->vtable[0xb8](2)` — semantics not yet decoded, but the return value gates the
   *  branch at @0x2d663. */
  __vtable_0xb8__(kind: number): boolean;
  /** vtable[0x8] — virtual dtor (used by dtor's per-vertex delete @0x2d231). */
  __delete__(): void;
}

// ── The class itself ─────────────────────────────────────────────────────────────────────────────

/**
 * OZSpline — the vertex-based spline the ProChannel curve/dynamic-spline family is built on.
 * This file adds the chunk-0 methods to the class surface expected by the rest of the port.
 * Provenance for the whole class: ProChannel.framework @0x2cd78 (first ctor).
 */
export class OZSpline {
  // Fields mirror the byte offsets recovered above. All are set by the ctors.
  /** (+0x08) internal PCSpinLock — used unless the externalLockManager at +0xa0 provides one. */
  private readonly _spinLock: PCSpinLockOpaque = new PCSpinLockOpaque();
  /** (+0x10..+0x20) allVertices vector — owning; dtor destroys each element via vtable[1]. */
  private _allVertices: OZVertex[] = [];
  /** (+0x28..+0x38) validVertices vector — weak refs into _allVertices; rebuilt on demand. */
  private _validVertices: OZVertex[] = [];
  /** (+0x48..+0x60) third owned buffer — zeroed in ctor; contents undecoded in this chunk. */
  private _buf48_begin: number = 0;
  private _buf48_end: number = 0;
  private _buf48_cap: number = 0;
  /** (+0x68) undecoded scalar/pointer zeroed by ctor @0x2cdaf. */
  private _f68: number = 0;
  /** (+0x70) bool set to 1 by ctor @0x2ce09. */
  private _f70_bool: boolean = true;
  /** (+0x78..+0x88) fourth vector — zeroed by ctor @0x2cddd/@0x2cde6; contents undecoded. */
  private _buf78_begin: number = 0;
  private _buf78_end: number = 0;
  private _buf78_cap: number = 0;
  /** (+0x90) dirty flag (copy @0x2d315 copies this byte). */
  private _dirty: boolean = false;
  /** (+0x91) "validListInit" bool — ctor sets 1 (@0x2cdef); copy forces 1 (@0x2d321). */
  private _validListInit: boolean = true;
  /** (+0x98) OZInterpolators* — heap-new'd in ctor (@0x2cdd6), deleted by dtor (@0x2d25d). */
  private _interpolators: unknown = null;
  /** (+0xa0) external lock manager — an object whose +0x30 field, if non-null, overrides our spin
   *  lock. Zeroed by the (state*) ctor (@0x2ce0c); set by other ctors we haven't decoded. */
  private _externalLockMgr: { lockPtrAt0x30: PCSpinLockOpaque | null } | null = null;
  /** (+0xa8) OZSplineState* — required argument to ctor; can be null in copy-ctor path (0x2d1dc). */
  private _sp: OZSplineState | null = null;

  /**
   * OZSpline::OZSpline(OZSplineState*) @ProChannel 0x2cd78 (C2). Corresponding C1 @0x2ce6a is a
   * trivial tail-jump to C2 (@0x2ce6f). Sequence transcribed line-for-line:
   *   1) vtable = &vtable_OZSpline (rip-relative @0x2cd85 → data @0xd5238).
   *   2) zero-init the PCSpinLock at +0x8 by writing 4-byte 0 into +0x8 and two XMM0-zeros into
   *      +0x10 and +0x20 (@0x2cd8f..0x2cd9d) — this simultaneously zeroes allVertices.begin/end/cap
   *      AND the spinlock tail.
   *   3) more zeroing at +0x30 (@0x2cda3), +0x48/+0x58 (@0x2cda7/0x2cdab), +0x68 (@0x2cdaf).
   *   4) store sp = arg2 at +0xa8 (@0x2cdb3); clear dirty flag at +0x90 (@0x2cdba).
   *   5) heap-allocate 0x18 bytes (@0x2cdc1..0x2cdc6 via operator new(0x18)) and construct
   *      an OZInterpolators there (@0x2cdd1); store its pointer at +0x98 (@0x2cdd6).
   *   6) zero +0x78 (xmm0, @0x2cddd) and +0x88 (@0x2cde6).
   *   7) validListInit = 1 at +0x91 (@0x2cdef).
   *   8) COPY xmm1 = *(+0x10) to +0x28 (@0x2cdf5/@0x2cdfd) — copies the already-zero (begin,end)
   *      into (validVertices.begin, validVertices.end). Same for xmm2 = *(+0x58) to +0x48
   *      (@0x2cdf9/@0x2ce01) — a redundant zero-copy that FCP emits verbatim; keep as no-op here.
   *   9) zero +0x38 via xmm0 (@0x2ce05) — the validVertices.cap.
   *  10) +0x70 = 1 (@0x2ce09); +0xa0 = 0 (@0x2ce0c).
   */
  constructor(sp: OZSplineState | null) {
    this._sp = sp;
    // Steps 1-2, 3, 4, 6, 7 are captured by the field initializers above. Step 5:
    this._interpolators = newOZInterpolators();
    // Step 8: the movups copies from just-zeroed regions — semantically no-op; validVertices is
    // already the empty array from the initializer. Step 10: externalLockMgr already null.
  }

  /**
   * OZSpline::OZSpline(OZSpline const&, OZSplineState*) @ProChannel 0x2ce74 (C2). Copy-ctor.
   * The FULL body walks the source's owned vectors and re-constructs them; decoding is deferred.
   * The C1 at @0x2d1dc is a tail-jump into C2.
   */
  static copyConstruct(_src: OZSpline, _sp: OZSplineState | null): OZSpline {
    throw new Error(
      "OZSpline::OZSpline(OZSpline const&, OZSplineState*) @ProChannel 0x2ce74 not yet transcribed",
    );
  }

  /**
   * OZSpline::~OZSpline() @ProChannel 0x2d1e6 (D2). Sequence:
   *   1) restore vtable pointer (@0x2d1f0) — resolves a class-in-destruction race for virtual calls.
   *   2) resolve the active lock: if +0xa0 != null && (+0xa0)->+0x30 != null, use that pointer,
   *      else use &(+0x8) internal spinlock (@0x2d1fa..0x2d20f). Then lock (@0x2d213).
   *   3) while (allVertices.begin != allVertices.end) {  // shrink from the end (@0x2d218..0x2d24c)
   *        vertex = *(end-1);
   *        if (vertex != null) { vertex->vtable[1](); }  // per-element virtual dtor @0x2d231
   *        *(end-1) = null; end--;
   *      }
   *   4) if +0x98 != null: OZInterpolators::~OZInterpolators() (@0x2d25d) then delete (@0x2d265);
   *      +0x98 = null (@0x2d26a).
   *   5) unlock (@0x2d28e).
   *   6) if +0x58 != null: cap = begin; delete +0x58 storage (@0x2d293..0x2d2a0).
   *   7) if +0x10 != null: cap = begin; delete +0x10 storage (@0x2d2a5..0x2d2b2).
   *   8) tail-call PCSpinLock::~PCSpinLock(this + 0x8) (@0x2d2c2).
   *
   * The D1 @0x2d2d2 is a tail-jump into D2. The D0 (deleting-dtor) @0x2d2dc calls D2 then
   * operator delete on `this`. Both are trivial wrappers around D2.
   */
  destroy(): void {
    // Step 2 — pick the lock. In this TS port the "external lock" indirection is preserved.
    const lock = this._externalLockMgr && this._externalLockMgr.lockPtrAt0x30
      ? this._externalLockMgr.lockPtrAt0x30
      : this._spinLock;
    lock.lock();
    // Step 3 — destroy each vertex from the end back.
    while (this._allVertices.length > 0) {
      const v = this._allVertices[this._allVertices.length - 1];
      if (v != null) v.__delete__();
      this._allVertices.pop();
    }
    // Step 4 — free the interpolators pool.
    if (this._interpolators != null) {
      deleteOZInterpolators(this._interpolators);
      this._interpolators = null;
    }
    lock.unlock();
    // Steps 6/7 — storage frees are JS-managed; leave the vectors empty.
    this._buf48_begin = this._buf48_end = this._buf48_cap = 0;
    this._validVertices.length = 0;
    // Step 8 — PCSpinLock dtor is a no-op in this opaque model.
  }

  /**
   * OZSpline::copy(OZSpline&, void*, void*) @ProChannel 0x2d2f8. Deep-copy of the source spline
   * into `dst`, remapping opaque handles via the two `void*` context args. Full body deferred.
   */
  static copy(_dst: OZSpline, _src: OZSpline, _ctx0: unknown, _ctx1: unknown): void {
    // First two instructions are transcribed here for provenance:
    //   +0x2d315:  movb (src+0x90), %al          — read dirty flag byte
    //   +0x2d31b:  movb %al, (dst+0x90)          — write dirty flag byte (dst._dirty = src._dirty)
    //   +0x2d321:  movb $1, (dst+0x91)           — force validListInit = 1
    // The vector-copy loops that follow are not yet decoded.
    throw new Error("OZSpline::copy @ProChannel 0x2d2f8 not yet transcribed");
  }

  /**
   * OZSpline::getVertexIter(void* handle) @ProChannel 0x2d49c
   *   __ZN8OZSpline13getVertexIterEPv
   *
   * Locate a vertex handle's iterator position, with a one-element-wide
   * "moving cursor" cache at +0x78. FULLY TRANSCRIBED (52 lines, verbatim):
   *
   *   0x2d49c  pushq  %rbp                     ; frame setup (no TS counterpart)
   *   0x2d49d  movq   %rsp,%rbp                ; frame setup (no TS counterpart)
   *   0x2d4a0  movq   0x28(%rdi),%rcx          ; rcx = validVertices.begin  (+0x28)
   *   0x2d4a4  movq   0x78(%rdi),%rax          ; rax = cachedIndex          (+0x78)
   *   0x2d4a8  movq   0x10(%rdi),%rdx          ; rdx = allVertices.begin    (+0x10)
   *   0x2d4ac  movq   0x18(%rdi),%r8           ; r8  = allVertices.end      (+0x18)
   *   0x2d4b0  subq   %rdx,%r8                 ; r8  = byte span of allVertices
   *   0x2d4b3  sarq   $0x3,%r8                 ; r8  = allVertices COUNT (8-byte ptrs)
   *   0x2d4b7  cmpq   %r8,%rax                 ; AT&T: cachedIndex - count
   *   0x2d4ba  jae    0x2d4c2                  ; UNSIGNED: out of range -> skip probe 0
   *   0x2d4bc  cmpq   %rsi,(%rdx,%rax,8)       ; allVertices[cachedIndex] == handle ?
   *   0x2d4c0  je     0x2d530                  ;   hit -> return validBegin + idx*8
   *   0x2d4c2  testq  %rax,%rax                ; SIGNED test of cachedIndex
   *   0x2d4c5  jle    0x2d4d7                  ;   <= 0 -> skip the (idx-1) probe
   *   0x2d4c7  leaq   -0x1(%rax),%r9           ; r9 = idx - 1
   *   0x2d4cb  cmpq   %r8,%r9                  ; UNSIGNED bound check
   *   0x2d4ce  jae    0x2d4d7
   *   0x2d4d0  cmpq   %rsi,-0x8(%rdx,%rax,8)   ; allVertices[idx-1] == handle ?
   *   0x2d4d5  je     0x2d526                  ;   hit -> cache r9, return validBegin + r9*8
   *   0x2d4d7  leaq   0x1(%rax),%r9            ; r9 = idx + 1
   *   0x2d4db  cmpq   %r8,%r9                  ; UNSIGNED bound check
   *   0x2d4de  jae    0x2d4e7
   *   0x2d4e0  cmpq   %rsi,0x8(%rdx,%rax,8)    ; allVertices[idx+1] == handle ?
   *   0x2d4e5  je     0x2d526                  ;   hit -> cache r9, return validBegin + r9*8
   *   -- slow path: linear scan of validVertices --
   *   0x2d4e7  movq   0x30(%rdi),%rdx          ; rdx = validVertices.end    (+0x30)
   *   0x2d4eb  movq   %rdx,%r8
   *   0x2d4ee  movq   %rcx,%rax                ; rax = cursor = validBegin
   *   0x2d4f1  subq   %rcx,%r8                 ; r8 = byte span of validVertices
   *   0x2d4f4  je     0x2d50e                  ;   EMPTY -> straight to the store
   *   0x2d4f6  cmpq   %rsi,(%rax)              ; *cursor == handle ?
   *   0x2d4f9  je     0x2d50e                  ;   found
   *   0x2d4fb  addq   $0x8,%rax                ; ++cursor
   *   0x2d4ff  cmpq   %rdx,%rax
   *   0x2d502  jne    0x2d4f6                  ; loop while cursor != end
   *   0x2d504  sarq   $0x3,%r8                 ; NOT FOUND: r8 = validVertices COUNT
   *   0x2d508  movq   %r8,0x78(%rdi)           ;   cachedIndex = count
   *   0x2d50c  jmp    0x2d521                  ;   ... and return validBegin
   *   0x2d50e  movq   %rax,%rsi                ; found/empty: rsi = cursor
   *   0x2d511  subq   %rcx,%rsi                ;   rsi = cursor - validBegin (bytes)
   *   0x2d514  sarq   $0x3,%rsi                ;   rsi = index
   *   0x2d518  movq   %rsi,0x78(%rdi)          ;   cachedIndex = index
   *   0x2d51c  cmpq   %rdx,%rax
   *   0x2d51f  jne    0x2d534                  ;   cursor != end -> return cursor
   *   0x2d521  movq   %rcx,%rax                ; else return validBegin
   *   0x2d524  jmp    0x2d534
   *   0x2d526  leaq   (%rcx,%r9,8),%rax        ; return validBegin + r9*8
   *   0x2d52a  movq   %r9,0x78(%rdi)           ;   cachedIndex = r9
   *   0x2d52e  jmp    0x2d534
   *   0x2d530  leaq   (%rcx,%rax,8),%rax       ; return validBegin + idx*8
   *                                            ;   (no +0x78 store — it ALREADY holds idx)
   *   0x2d534  popq   %rbp                     ; teardown (no TS counterpart)
   *   0x2d535  retq                            ; returns an iterator (pointer) in %rax
   *
   * DECODE NOTES — three things here are surprising and are transcribed, not
   * smoothed over:
   *
   *   1. THE PROBES READ `allVertices`, THE RESULT INDEXES `validVertices`.
   *      The three cached-index probes compare against `(%rdx,...)` = the
   *      +0x10 vector (@0x2d4bc/@0x2d4d0/@0x2d4e0) and their bound is that
   *      vector's count (@0x2d4b3), yet every return builds the iterator from
   *      `%rcx` = the +0x28 vector's begin (@0x2d526/@0x2d530), which is also
   *      the range the slow path scans (@0x2d4e7..@0x2d502). The fast path is
   *      therefore only correct while the two vectors are index-parallel — an
   *      invariant the binary assumes (validVertices is rebuilt from
   *      allVertices; see the +0x91 "validListInit" flag). The port keeps the
   *      two reads exactly where the machine puts them rather than "fixing"
   *      the fast path to read the vector it indexes.
   *   2. NOT FOUND RETURNS `begin`, NOT `end` (@0x2d504..@0x2d50c -> @0x2d521).
   *      A caller cannot distinguish "found at index 0" from "not found" by
   *      the return value alone — the discriminator is the cached index left
   *      at +0x78: `count` when the scan failed, the hit's index otherwise.
   *      The empty-vector path lands on the same `return begin` (@0x2d4f4 ->
   *      @0x2d50e -> @0x2d521), where begin == end anyway.
   *   3. THE BOUND CHECKS ARE UNSIGNED (`jae`) BUT THE `idx > 0` TEST IS
   *      SIGNED (`jle` @0x2d4c5). A negative cached index therefore fails
   *      every `jae` bound (it is huge unsigned) and skips the (idx-1) probe,
   *      but the (idx+1) probe's r9 CAN pass the bound — with idx == -1 the
   *      addressed element `0x8(%rdx,%rax,8)` is exactly allVertices[0]. The
   *      port reproduces that arithmetic instead of clamping.
   *
   * MODEL: the C++ returns `std::vector<OZVertex*>::iterator`, i.e. a raw
   * pointer into validVertices. This port returns the equivalent ELEMENT INDEX
   * `(ret - validBegin) / 8` — the same representation the other OZSpline
   * chunks already assume for this symbol (see `_OZSpline_getVertexIter` in
   * OZSpline.m2.ts, which is typed `-> number`). Index 0 is `begin`, so quirk
   * (2) shows up as "returns 0".
   *
   * +0x78 FOOTNOTE: this body proves the slot at +0x78 is a SCALAR cached
   * index — it is compared against an element count (@0x2d4b7) and written
   * with an index (@0x2d508/@0x2d518/@0x2d52a) — and not the `begin` pointer
   * of a fourth vector, which is what this file's field name `_buf78_begin`
   * guessed from the ctor's 16-byte zero store @0x2cddd. The field is REUSED
   * here rather than shadowed by a second field, so one byte offset keeps one
   * name (the OZRenderParams +0x1e5 double-modelling trap).
   *
   * CALLEES: none. No callq, no in-scope dependency, no extern, no indirect or
   * virtual dispatch (`depgraph.py deps` lists nothing). It does NOT take the
   * spinlock — the WithLock wrappers are separate symbols.
   *
   * @param handle the `void*` vertex handle in %rsi.
   * @returns the element index of the iterator in %rax (0 == begin).
   */
  getVertexIter(handle: unknown): number {
    // @0x2d4a0  rcx = validVertices.begin (+0x28) — the array every return indexes.
    const valid = this._validVertices;
    // @0x2d4a4  rax = cachedIndex (+0x78).
    const cachedIndex = this._buf78_begin;
    // @0x2d4a8..@0x2d4b3  count of the +0x10 vector: (end - begin) >> 3.
    const allCount = this._allVertices.length;

    // @0x2d4b7..@0x2d4c0  probe 0: the cached index itself. `jae` is UNSIGNED,
    // so a negative cached index fails the bound.
    if (cachedIndex >= 0 && cachedIndex < allCount) {
      if ((this._allVertices[cachedIndex] as unknown) === handle) {
        // @0x2d530  leaq (%rcx,%rax,8) — return validBegin + idx*8. NOTE: no
        // store to +0x78; it already holds this index.
        return cachedIndex;
      }
    }

    // @0x2d4c2..@0x2d4c5  testq/jle — SIGNED: only probe idx-1 when idx > 0.
    if (cachedIndex > 0) {
      const prev = cachedIndex - 1; // @0x2d4c7  leaq -0x1(%rax),%r9
      // @0x2d4cb..@0x2d4ce  UNSIGNED bound check on r9.
      if (prev < allCount) {
        // @0x2d4d0  cmpq %rsi,-0x8(%rdx,%rax,8) — allVertices[idx-1].
        if ((this._allVertices[prev] as unknown) === handle) {
          // @0x2d52a  cachedIndex = r9 ; @0x2d526 return validBegin + r9*8.
          this._buf78_begin = prev;
          return prev;
        }
      }
    }

    // @0x2d4d7  leaq 0x1(%rax),%r9 — probe idx+1 (reached whether or not the
    // idx-1 probe ran).
    const next = cachedIndex + 1;
    // @0x2d4db..@0x2d4de  UNSIGNED bound check on r9.
    if (next >= 0 && next < allCount) {
      // @0x2d4e0  cmpq %rsi,0x8(%rdx,%rax,8) — the element one slot past the
      // cached index, i.e. allVertices[idx+1].
      if ((this._allVertices[next] as unknown) === handle) {
        // @0x2d52a  cachedIndex = r9 ; @0x2d526 return validBegin + r9*8.
        this._buf78_begin = next;
        return next;
      }
    }

    // -- slow path @0x2d4e7: linear scan of validVertices --
    // @0x2d4e7..@0x2d4f1  rdx = validVertices.end, cursor = begin, r8 = span.
    const validCount = valid.length;
    let cursor = 0;
    // @0x2d4f4  je 0x2d50e — an EMPTY vector skips the loop entirely.
    if (validCount !== 0) {
      for (;;) {
        // @0x2d4f6..@0x2d4f9  cmpq %rsi,(%rax) ; je 0x2d50e
        if ((valid[cursor] as unknown) === handle) {
          break;
        }
        // @0x2d4fb  addq $0x8,%rax
        cursor += 1;
        // @0x2d4ff..@0x2d502  cmpq %rdx,%rax ; jne — loop while cursor != end.
        if (cursor === validCount) {
          // @0x2d504..@0x2d508  NOT FOUND: cachedIndex = count …
          this._buf78_begin = validCount;
          // @0x2d50c -> @0x2d521  … and the returned iterator is `begin`.
          return 0;
        }
      }
    }

    // @0x2d50e..@0x2d518  found (or empty): cachedIndex = cursor - begin.
    this._buf78_begin = cursor;
    // @0x2d51c..@0x2d51f  cmpq %rdx,%rax ; jne 0x2d534 — return the cursor …
    if (cursor !== validCount) {
      return cursor;
    }
    // @0x2d521  … else return `begin` (the empty-vector case, where they are
    // the same position anyway).
    return 0;
  }

  /**
   * OZSpline::operator=(OZSpline const&) @ProChannel 0x2d536 — assignment operator. Not yet
   * transcribed; the body is essentially a self-check + tear-down + re-copy dispatch.
   */
  assign(_rhs: OZSpline): OZSpline {
    throw new Error("OZSpline::operator= @ProChannel 0x2d536 not yet transcribed");
  }

  /**
   * OZSpline::operator==(OZSpline const&) const @ProChannel 0x2d5b2 — structural equality. Not yet
   * transcribed. Field comparisons include the two vector contents and OZSplineState (+0xa8).
   */
  equals(_rhs: OZSpline): boolean {
    throw new Error("OZSpline::operator== @ProChannel 0x2d5b2 not yet transcribed");
  }

  /**
   * OZSpline::setInterpolation(unsigned int) @ProChannel 0x2d614. Sequence:
   *   1) if arg == 0x64 (100 = "MIXED"): early-return (@0x2d614..0x2d619) — a MIXED input means
   *      "leave each vertex's own interpolation alone", so no state change.
   *   2) otherwise, take the lock (@0x2d643) and iterate the validVertices vector at [0x28..0x30):
   *      for each vertex, if vertex->vtable[0xb8](kind=2) is TRUE (@0x2d65d..0x2d663) and
   *      *sp->+0x00 == 1 (@0x2d667..0x2d670), then <undecoded branch continues past our chunk>.
   *      Full body is longer than the priority window; deferred as a throw stub.
   */
  setInterpolation(kind: number): void {
    if ((kind >>> 0) === 0x64) return;
    throw new Error("OZSpline::setInterpolation @ProChannel 0x2d614 body past 0x2d643 not yet transcribed");
  }

  /**
   * OZSpline::getInterpolation(unsigned int* outKind, bool* outUsesTangents, bool* outMonotonic)
   *   @ProChannel 0x2d6da. FULLY TRANSCRIBED (small, self-contained):
   *   • if allVertices is empty (begin==end at [+0x10,+0x18)): *outKind = sp->u4 (state's default
   *     interpolation at OZSplineState +0x20, @0x2d735..0x2d73c).
   *   • else: walk validVertices [+0x28, +0x30). Take the FIRST vertex's virtual getInterpolation
   *     (vtable[0xd0], @0x2d709) as the seed. For every subsequent vertex, if any differs, set
   *     *outKind = 0x64 (MIXED) and stop the walk (@0x2d729..0x2d733).
   *   • if outUsesTangents != null: call this->interpolatorUsesTangents(*outKind, 0)
   *     (@0x2d74e); store the boolean at *outUsesTangents.
   *   • if outMonotonic != null: look up the interpolator for *outKind via
   *     OZInterpolators::getInterpolator (@0x2d766), then call that interpolator's virtual at
   *     vtable+0x40 (@0x2d771). XOR the low byte with 1 (@0x2d774) — i.e. store
   *     `!bool(interpolator.vtable[0x40](interpolator))` into *outMonotonic.
   *   • return true (movb $1, %al @0x2d778).
   *
   * We surface an object-returning form rather than out-params (idiomatic in TS); the semantics
   * mirror the disasm bit-for-bit modulo the throw stubs for undecoded downstream callees.
   */
  getInterpolation(): { kind: number; usesTangents: boolean; monotonic: boolean } {
    let kind: number;
    if (this._allVertices.length === 0) {
      // sp->u4 lives at OZSplineState +0x20 (see OZSplineState.ts b0..u4 layout).
      const sp = this._sp;
      if (sp == null) {
        throw new Error(
          "OZSpline::getInterpolation @ProChannel 0x2d735 null sp: OZSplineState* is required to read u4",
        );
      }
      kind = (sp as unknown as { u4?: number }).u4 ?? 0;
    } else {
      // Walk validVertices; seed from index 0's virtual getInterpolation().
      const vv = this._validVertices;
      const seed = vv[0].__getInterpolation__();
      kind = seed;
      for (let i = 1; i < vv.length; i++) {
        const k = vv[i].__getInterpolation__();
        if (k !== seed) {
          kind = 0x64;
          break;
        }
      }
    }
    // interpolatorUsesTangents dispatches to a virtual on the current interpolator — the exact
    // dispatch is transcribed by OZSpline::interpolatorUsesTangents @0x2d78a below.
    const usesTangents = this.interpolatorUsesTangents(kind, null);
    // Monotonic: interpolator->vtable[0x40]() XOR 1.  vtable[0x40] returns a bool; caller reads
    // its complement. We can't invoke it faithfully until OZInterpolators is decoded — throw.
    // (Anti-shortcut: never fake a monotonic value.)
    const interp = ozInterpolatorsGetInterpolator(this._interpolators, kind);
    // The following line will throw until the interpolator's vtable[0x40] is decoded.
    const _monotonicBit = (interp as unknown as { __vtable_0x40__(): boolean }).__vtable_0x40__();
    const monotonic = !_monotonicBit;
    return { kind, usesTangents, monotonic };
  }

  /**
   * OZSpline::interpolatorUsesTangents(unsigned int, void*) @ProChannel 0x2d78a. This is a
   * one-liner in the disassembly (look up the interpolator, then invoke a virtual that returns
   * bool). Not yet transcribed — deferred to a later chunk to keep this one bounded.
   */
  interpolatorUsesTangents(_kind: number, _ctx: unknown): boolean {
    throw new Error("OZSpline::interpolatorUsesTangents @ProChannel 0x2d78a not yet transcribed");
  }

  /**
   * OZSpline::setExtrapolation(unsigned int mode, unsigned int arg) @ProChannel 0x2d7e6.
   * Not yet transcribed. The body writes into a small extrapolation state block near +0x68
   * (based on ctor's zero-init of that slot).
   */
  setExtrapolation(_mode: number, _arg: number): void {
    throw new Error("OZSpline::setExtrapolation @ProChannel 0x2d7e6 not yet transcribed");
  }

  /**
   * OZSpline::getExtrapolation(unsigned int) @ProChannel 0x2d856. Not yet transcribed. Small
   * accessor that reads from the same extrapolation state block set by setExtrapolation.
   */
  getExtrapolation(_which: number): number {
    throw new Error("OZSpline::getExtrapolation @ProChannel 0x2d856 not yet transcribed");
  }

  /**
   * OZSpline::getRangeU(CMTime const&) @ProChannel 0x2d86e. Returns the [minU, maxU] time range
   * of the enabled vertices at the given evaluation time. Body not yet transcribed — this is one
   * of the medium-complexity vertex-walk methods that belongs in a dedicated chunk.
   */
  getRangeU(_t: unknown): unknown {
    throw new Error("OZSpline::getRangeU @ProChannel 0x2d86e not yet transcribed");
  }

  /**
   * OZSpline::preSplineAccess(bool) @ProChannel 0x2d034 — take the spline's lock (external or
   * internal) and rebuild the valid-vertex list if the dirty flag is set. Not yet transcribed.
   */
  preSplineAccess(_lockOnly: boolean): void {
    throw new Error("OZSpline::preSplineAccess @ProChannel 0x2d034 not yet transcribed");
  }

  /**
   * OZSpline::refreshValidVerticesList() @ProChannel 0x2d0ec — filter allVertices [+0x10..+0x18)
   * by the "enabled" predicate and populate validVertices [+0x28..+0x30). Not yet transcribed.
   */
  refreshValidVerticesList(): void {
    throw new Error("OZSpline::refreshValidVerticesList @ProChannel 0x2d0ec not yet transcribed");
  }

  /**
   * OZSpline::postSplineAccess(bool) @ProChannel 0x2d1ac — release the lock taken by
   * preSplineAccess. Not yet transcribed.
   */
  postSplineAccess(_lockOnly: boolean): void {
    throw new Error("OZSpline::postSplineAccess @ProChannel 0x2d1ac not yet transcribed");
  }
}
