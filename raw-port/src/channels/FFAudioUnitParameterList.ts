// raw-port: FFAudioUnitParameterList — Flexo framework (channels layer)
//
// FFAudioUnitParameterList is a heap-owned array of FFAudioUnitParameterInfo
// records (0x28 = 40 bytes per element). Its layout mirrors std::vector<T>:
//
//   +0x00 (T*)  begin        — pointer to first element, or null when empty
//   +0x08 (T*)  end          — one-past-last element pointer
//   (+0x10 (T*) capacity     — NOT observed by the two methods decoded here,
//                              but present in the C++ std::vector layout.)
//
// Element `FFAudioUnitParameterInfo` (size 0x28, opaque):
//   +0x00 (u32)  id          — decoded here via FindID @0x532b00 (`cmpl %esi, (%rax)`)
//   +0x04..+0x27 opaque tail (undecoded here)
//
// Published entry points:
//   0x005259c0  FFAudioUnitParameterList::~FFAudioUnitParameterList() (D1)
//   0x00532af0  FFAudioUnitParameterList::FindID(unsigned int) const
//   0x00532b10  FFAudioUnitParameterList::CollectParameterInfo(
//                   ComponentInstanceRecord*, unsigned int, unsigned int)
//   0x00532ef0  FFAudioUnitParameterList::CalculateParameterChanges(
//                   FFAudioUnitParameterList const&,
//                   std::__1::vector<u32>&, std::__1::vector<u32>&,
//                   std::__1::vector<u32>&) const
//
// The two structurally simple methods (~D1 and FindID) are decoded
// faithfully below. The two heavy methods are throw-stubs (the honest
// surface for a decode-boundary):
//
//   • CollectParameterInfo (232 lines) — calls into Apple's AudioUnit
//     C-API + std::vector<FFAudioUnitParameterInfo> capacity growth.
//     Both are undecoded external frontiers.
//   • CalculateParameterChanges (307 lines) — three separate
//     std::vector<unsigned int>::push_back capacity-growth paths plus
//     FFAudioUnitParameterInfo equality (undecoded predicate on the
//     opaque tail bytes).
//
// Both stubs cite their entry addresses so callers see the frontier at
// the point of use.

/**
 * Opaque handle to an `FFAudioUnitParameterInfo` record. The only
 * observed field is `id` (u32) at offset +0x00 — the remaining 36
 * bytes are undecoded here.
 */
export interface FFAudioUnitParameterInfo {
  /** @+0x00 u32 — parameter ID (read by FindID @0x532b00). */
  readonly id: number;
  /** Opaque tail bytes (@+0x04..+0x27), undecoded. */
  readonly _opaque?: unknown;
}

/**
 * Injected destructor for `FFAudioUnitParameterInfo`. Called once per
 * element by ~FFAudioUnitParameterList @0x5259f7. Undecoded frontier
 * (`__ZN24FFAudioUnitParameterInfoD1Ev`); pass a real destructor to
 * make dispose() faithful, or leave null to treat elements as trivially
 * destructible.
 */
export type FFAudioUnitParameterInfoDestructor = (
  info: FFAudioUnitParameterInfo,
) => void;

/**
 * Opaque handle for `ComponentInstanceRecord*` (Apple AudioUnit C-API).
 * Passed to CollectParameterInfo @0x532b10.
 */
export type ComponentInstanceRecord = { readonly __brand: "ComponentInstance" };

/**
 * FFAudioUnitParameterList — a heap-owned array of parameter descriptors.
 *
 * In C++ this holds three raw pointers laid out like std::vector's
 * fields (begin, end, capacity). We surface `_elements` as a JS array
 * — the callers that build via CollectParameterInfo are unimplemented
 * here (see the frontier stub), so lists are ONLY created externally
 * (from decoded data) or empty.
 */
export class FFAudioUnitParameterList {
  /**
   * The parameter-info array. When empty, this array's length is 0;
   * that maps to the C++ `_begin == null` sentinel checked @0x5259cd
   * (an empty std::vector never allocates, so both begin and end are 0).
   */
  private _elements: FFAudioUnitParameterInfo[];

  /**
   * Optional injected element destructor (see
   * FFAudioUnitParameterInfoDestructor).
   */
  private _elementDtor: FFAudioUnitParameterInfoDestructor | null;

  constructor(
    init: {
      elements?: FFAudioUnitParameterInfo[];
      elementDtor?: FFAudioUnitParameterInfoDestructor | null;
    } = {},
  ) {
    this._elements = init.elements ? [...init.elements] : [];
    this._elementDtor = init.elementDtor ?? null;
  }

  /** Number of parameter descriptors currently held. */
  size(): number {
    return this._elements.length;
  }

  /** Read-only view of the elements. */
  elements(): readonly FFAudioUnitParameterInfo[] {
    return this._elements;
  }

  /**
   * FFAudioUnitParameterList::~FFAudioUnitParameterList()   @0x005259c0
   *   (D1, base non-deleting)
   *
   * Faithful asm mirror. Walks the array of 0x28-byte elements in
   * REVERSE (asm iterates end-to-begin), calls each element's dtor
   * (@0x5259f7), then frees the whole storage block via operator delete
   * (@0x525a12).
   *
   *   @0x5259c0..0x5259c9  prologue: push %rbp; save %r15/%r14/%rbx; carve stack
   *   @0x5259ca  movq (%rdi), %r15                     ; %r15 = this->_begin
   *   @0x5259cd  testq %r15, %r15
   *   @0x5259d0  je    0x525a17                        ; empty vector → skip
   *   @0x5259d2  movq %rdi, %rbx                       ; %rbx = this
   *   @0x5259d5  movq 0x8(%rdi), %r14                  ; %r14 = this->_end
   *   @0x5259d9  movq %r15, %rdi                       ; %rdi = _begin (for later free)
   *   @0x5259dc  cmpq %r14, %r15
   *   @0x5259df  je   0x525a04                         ; begin == end → nothing to dtor
   *   ─── reverse iter loop @0x5259f0 ──────────────
   *   @0x5259f0  addq $-0x28, %r14                     ; %r14 -= sizeof(T) = 40
   *   @0x5259f4  movq %r14, %rdi                       ; %rdi = &element
   *   @0x5259f7  callq FFAudioUnitParameterInfo::~D1   ; element dtor
   *   @0x5259fc  cmpq %r15, %r14
   *   @0x5259ff  jne  0x5259f0                         ; loop until %r14 reaches _begin
   *   @0x525a01  movq (%rbx), %rdi                     ; reload %rdi = _begin
   *   ─── join @0x525a04 ──────────────────────────
   *   @0x525a04  movq %r15, 0x8(%rbx)                  ; this->_end = _begin (empty)
   *   @0x525a08..0x525a11  epilogue
   *   @0x525a12  jmp __ZdlPv                           ; tail-call operator delete(_begin)
   *   ─── null-vector skip path @0x525a17 ─────────
   *   @0x525a17..0x525a21  epilogue; ret               ; nothing to free
   *
   * The JS mirror runs the element dtor callback for each element in
   * reverse (matching asm order), clears the internal array (equivalent
   * to `this->_end = this->_begin` and the operator-delete tail-call —
   * JS GC handles the storage).
   */
  dispose(): void {
    // @0x5259ca..0x5259d0: null-check on _begin.
    if (this._elements.length === 0) {
      // @0x525a17: nothing to do (empty container, no allocation to free).
      return;
    }

    // @0x5259f0..0x5259ff: reverse iterate, dtor each element.
    for (let i = this._elements.length - 1; i >= 0; i--) {
      const elem = this._elements[i];
      // @0x5259f7 — element dtor call.
      if (this._elementDtor !== null) {
        this._elementDtor(elem);
      }
      // If no dtor is injected, elements are treated as trivially
      // destructible. FFAudioUnitParameterInfo's true dtor is undecoded
      // (frontier symbol __ZN24FFAudioUnitParameterInfoD1Ev), so callers
      // needing full teardown MUST inject one.
    }

    // @0x525a04: _end = _begin (empty).
    // @0x525a12: operator delete(_begin) — JS GC handles storage.
    this._elements = [];
    this._elementDtor = null;
  }

  /**
   * FFAudioUnitParameterList::FindID(unsigned int) const   @0x00532af0
   *
   * Linear scan for the first element whose `id` field (u32 @+0x00)
   * matches the argument. Returns a pointer to the found element, or
   * the container's `_end` sentinel when not found.
   *
   * Faithful asm mirror:
   *   @0x532af0  movq (%rdi), %rax                      ; %rax = _begin
   *   @0x532af3  movq 0x8(%rdi), %rcx                   ; %rcx = _end
   *   @0x532af7  cmpq %rcx, %rax
   *   @0x532afa  je   0x532b0e                          ; empty → jump to ret
   *   @0x532afc..0x532afd  push %rbp; mov %rsp, %rbp    ; (only reached if non-empty)
   *   ─── scan loop @0x532b00 ──────────────────────
   *   @0x532b00  cmpl %esi, (%rax)                      ; compare *rax.id vs %esi
   *   @0x532b02  je   0x532b0d                          ; match → break
   *   @0x532b04  addq $0x28, %rax                       ; advance by sizeof(T)
   *   @0x532b08  cmpq %rcx, %rax
   *   @0x532b0b  jne  0x532b00                          ; continue while %rax < _end
   *   ─── ret ────────────────────────────────────
   *   @0x532b0d  popq %rbp
   *   @0x532b0e  retq                                   ; %rax = matched or _end
   *
   * Return convention: %rax is `FFAudioUnitParameterInfo*`. On no-
   * match it's `_end` (a one-past-the-end pointer). The C++ idiom is
   * `if (found == list._end) not_found`.
   *
   * In JS we return the matched element object on hit, or `null` on
   * miss (a semantically equivalent contract — callers must check
   * `== null` instead of `== _end`).
   */
  findID(id: number): FFAudioUnitParameterInfo | null {
    // @0x532af0..0x532afa: early return for empty container.
    if (this._elements.length === 0) {
      return null;
    }
    // @0x532b00..0x532b0b: linear scan.
    // NOTE: the asm compares LOW 32 bits (`cmpl %esi, (%rax)`), so we
    // mask both sides to u32 to preserve exact behaviour if callers
    // pass a wider or negative value.
    const idU32 = id >>> 0;
    for (const elem of this._elements) {
      if ((elem.id >>> 0) === idU32) {
        // @0x532b02 — match; return the element (asm returns pointer).
        return elem;
      }
    }
    // Fall-through @0x532b0e: no match. Asm returns %rax == _end.
    return null;
  }

  /**
   * FFAudioUnitParameterList::CollectParameterInfo(
   *     ComponentInstanceRecord* audioUnit,
   *     unsigned int scope,
   *     unsigned int element)                           @0x00532b10
   *
   * UNDECODED FRONTIER — 232-line asm.
   *
   * The function calls into Apple's AudioUnit C-API to enumerate
   * parameter metadata for the given AudioUnit scope/element pair,
   * then populates `this` via std::vector-style allocator growth
   * (matching the `~D1` layout: begin/end/capEnd).
   *
   * Faithfully transcribing this requires decoding:
   *   • AudioUnitGetPropertyInfo/AudioUnitGetProperty entry stubs
   *     (multiple `callq *0xNNN(%rip)` indirect calls through the
   *      __la_symbol_ptr table)
   *   • The libc++ std::vector<FFAudioUnitParameterInfo> allocation
   *     path (__ZNSt3__16vectorI…) including capacity doubling
   *   • FFAudioUnitParameterInfo's copy/move constructor
   *
   * All three are outside the current decode boundary. Full asm is
   * preserved at
   *   raw-port/re/disasm/Flexo.FFAudioUnitParameterList.CollectParameterInfo.s
   * for future work. Callers that need parameter collection must
   * construct FFAudioUnitParameterList directly with pre-collected
   * elements passed to the constructor.
   */
  CollectParameterInfo(
    audioUnit: ComponentInstanceRecord,
    scope: number,
    element: number,
  ): void {
    void audioUnit;
    void scope;
    void element;
    throw new Error(
      "FFAudioUnitParameterList.CollectParameterInfo: undecoded frontier @0x532b10 " +
        "(232-line asm calling Apple AudioUnit C-API + std::vector<FFAudioUnitParameterInfo> allocator growth)",
    );
  }

  /**
   * FFAudioUnitParameterList::CalculateParameterChanges(
   *     const FFAudioUnitParameterList& other,
   *     std::vector<u32>& addedIds,
   *     std::vector<u32>& removedIds,
   *     std::vector<u32>& changedIds) const              @0x00532ef0
   *
   * UNDECODED FRONTIER — 307-line asm.
   *
   * The function computes the set-difference and value-difference of
   * `*this` and `other`, appending parameter IDs into the three output
   * `std::__1::vector<unsigned int>` buffers passed by reference. The
   * heavy machinery is:
   *   • Three separate libc++ std::vector<unsigned int>::push_back
   *     paths with allocator growth (capacity doubling)
   *   • Value-level comparison of FFAudioUnitParameterInfo tail bytes
   *     (the 36 bytes after `.id`) to distinguish "changed" from
   *     "unchanged" — undecoded predicate
   *
   * Full asm is preserved at
   *   raw-port/re/disasm/Flexo.FFAudioUnitParameterList.CalculateParameterChanges.s
   * for future work. Callers can compute the diff externally against
   * the `.findID()` primitive if needed.
   */
  CalculateParameterChanges(
    other: FFAudioUnitParameterList,
    addedIds: number[],
    removedIds: number[],
    changedIds: number[],
  ): void {
    void other;
    void addedIds;
    void removedIds;
    void changedIds;
    throw new Error(
      "FFAudioUnitParameterList.CalculateParameterChanges: undecoded frontier @0x532ef0 " +
        "(307-line asm with 3× std::vector<unsigned int>::push_back allocator growth + " +
        "FFAudioUnitParameterInfo equality predicate — decode boundary)",
    );
  }
}
