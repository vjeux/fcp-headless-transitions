// PCICCTag.ts — 32-byte POD that pairs a uint32 ICC "signature" (4-char tag ID like 'desc',
// 'wtpt') with a std::vector<uint8_t> of raw tag bytes. Every accessor is a direct field
// read/write onto the inline vector's three pointer slots (begin/end/endcap). No virtuals,
// no destructor exported (trivial dtor — the vector's own dtor is emitted at type destruction),
// no inheritance.
//
// Framework: ProCore.framework (Final Cut Pro).
//
// DECODE (raw-port/re/disasm/):
//   ProCore.PCICCTag.PCICCTag.s                (C1 @0xb69ce)   (C2 twin @0xb699a — identical body)
//   ProCore.PCICCTag.reset.s                   (@0xb6a02)
//   ProCore.PCICCTag.getSignature.s            (@0xb6a12)
//   ProCore.PCICCTag.setSignature.s            (@0xb6a1a)
//   ProCore.PCICCTag.empty.s                   (@0xb6a22)
//   ProCore.PCICCTag.data.s                    (@0xb6a34, const twin @0xb6a3e)
//   ProCore.PCICCTag.size.s                    (@0xb6a48)
//   ProCore.PCICCTag.resize.s                  (@0xb6a56)
//   ProCore.PCICCTag.clear.s                   (@0xb6a86)
//   ProCore.PCICCTag.operator[].s              (@0xb6a94, const twin @0xb6aa2)
//   ProCore.PCICCTag.push_back.s               (@0xb6ab0)
//
// Struct layout (recovered from field offsets in each method):
//
//   +0x00  signature : uint32_t              (ctor: `movl %esi, (%rdi)`, and read by
//                                             getSignature @0xb6a16 as `movl (%rdi), %eax`)
//   +0x04  <padding>                          (Itanium ABI aligns the vector's uint8_t* fields
//                                             to 8; observed via the +0x8 read for begin)
//   +0x08  vec_begin : uint8_t*               (data()/data() const/operator[] read this;
//                                             ctor writes `xorps %xmm0,%xmm0; movups %xmm0,0x8`
//                                             — clears begin AND end together as a 16-byte
//                                             null-pointer pair before delegating to
//                                             vector::__init_with_size)
//   +0x10  vec_end   : uint8_t*               (size()/empty() compare against begin;
//                                             clear/reset set end = begin; resize either
//                                             delegates to __append(delta) or does end = begin+n)
//   +0x18  vec_endcap: uint8_t*               (ctor sets `movq $0x0, 0x18(%rdi)` — the third
//                                             slot of a libc++ vector, i.e. the capacity ptr)
//
// The three pointer slots +0x08/+0x10/+0x18 are the libc++ std::vector<uint8_t> ABI:
//   {__begin_, __end_, __end_cap_}. In this TS port we model the vector faithfully with
//   Uint8Array-based bookkeeping so the .begin+i / .end == .begin semantics are visible.
//
// A note on `operator[]`: BOTH the const and non-const variants return a POINTER
// (uint8_t*) equal to `begin + i` — that's what `movq %rsi,%rax; addq 0x8(%rdi),%rax`
// computes. This is unusual (std::vector's operator[] returns a reference-to-byte, not
// a pointer). In the TS port we surface it as a struct { data, offset } so callers can
// still deref/write through the position; that IS the C++ reference-return semantics
// preserved through a byte-addressable vector.
//
// The vector primitives ARE NOT decoded here (they live in libc++'s __init_with_size /
// __append / push_back — the demangled call targets). Per ANTI_SHORTCUT rule P4, they
// are routed through THROWING stubs citing their @0xADDR so a consumer cannot silently
// observe a wrong buffer.

/**
 * `std::vector<uint8_t>::__init_with_size(first, last, size)` — external.
 * @external @ProCore 0x00000000000a9b2e
 *   (__ZNSt3__16vectorIhNS_9allocatorIhEEE16__init_with_sizeB9nqe210106IPKhS6_EEvT_T0_m)
 *
 * Allocates `size` bytes, copies [first, last) into begin, sets end = begin + size,
 * endcap = begin + capacity(size). Not yet decoded. Throws on invocation per P4.
 */
function vector_uint8_init_with_size(
  _vec: PCVectorUint8,
  _first: Uint8Array,
  _firstOff: number,
  _last: Uint8Array,
  _lastOff: number,
  _size: number,
): void {
  throw new Error(
    "std::vector<uint8_t>::__init_with_size[abi:nqe210106](first, last, size) " +
      "not yet transcribed @0x00000000000a9b2e",
  );
}

/**
 * `std::vector<uint8_t>::__append(n)` — external.
 * @external @ProCore 0x00000000000a9a2c
 *   (__ZNSt3__16vectorIhNS_9allocatorIhEEE8__appendEm)
 *
 * Grows the vector by `n` value-initialized (zero) bytes: advances end by n, expanding
 * the underlying storage if endcap would be exceeded. Not yet decoded. Throws per P4.
 */
function vector_uint8_append(_vec: PCVectorUint8, _n: number): void {
  throw new Error(
    "std::vector<uint8_t>::__append(unsigned long) not yet transcribed @0x00000000000a9a2c",
  );
}

/**
 * `std::vector<uint8_t>::push_back(uint8_t const&)` — external.
 * @external @ProCore 0x00000000000b6ad2
 *   (__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh)
 *
 * If end < endcap: *end = value, ++end. Else: reallocate then append. Not yet decoded.
 * Throws per P4.
 */
function vector_uint8_push_back(_vec: PCVectorUint8, _value: number): void {
  throw new Error(
    "std::vector<uint8_t>::push_back[abi:nqe210106](uint8_t const&) " +
      "not yet transcribed @0x00000000000b6ad2",
  );
}

/**
 * Inline `std::vector<uint8_t>` at +0x08 of PCICCTag. Fields laid out to match libc++:
 *   {begin, end, endcap} as three uint8_t* — modeled as index-into-`storage` since JS has
 *   no raw pointers. `end - begin` is the size, `endcap - begin` is the capacity.
 *
 * Invariant: `storage.length === endcap` (endcap is EXACTLY the storage length).
 */
export interface PCVectorUint8 {
  storage: Uint8Array;
  begin: number;
  end: number;
  endcap: number;
}

/**
 * Cursor into a PCVectorUint8 — the "reference" returned by operator[](i). Reads and
 * writes go directly to `storage[begin + i]`. This models the C++ `uint8_t&` return by
 * exposing a getter/setter pair; the FCP asm computes a raw pointer `begin+i`.
 */
export interface PCICCTagByteRef {
  vec: PCVectorUint8;
  offset: number;
}

/**
 * `PCICCTag::PCICCTag(uint32_t signature, uint8_t const* first, uint8_t const* last)`
 * — construct with a signature and an initial byte range [first, last).
 * @ProCore 0x00000000000b69ce  (__ZN8PCICCTagC1EjPKhS1_)
 * @ProCore 0x00000000000b699a  (__ZN8PCICCTagC2EjPKhS1_)  — C2 twin, identical body
 *
 * DECODE (raw-port/re/disasm/ProCore.PCICCTag.PCICCTag.s):
 *   0xb69ce-0xb69d0  prologue
 *   0xb69d2           rax = rdx = first
 *   0xb69d5           movl %esi, (%rdi)                                — signature = sig
 *   0xb69d7           leaq 0x8(%rdi), %rsi                              — &vec (as vector's this)
 *   0xb69db           r8 = rcx = last
 *   0xb69de           subq %rdx, %r8                                    — r8 = last - first (byte size)
 *   0xb69e1-0xb69e4   xorps %xmm0,%xmm0; movups %xmm0, 0x8(%rdi)        — {begin=0, end=0}
 *   0xb69e8           movq $0x0, 0x18(%rdi)                             — endcap = 0
 *   0xb69f0           rdx = rcx (last), rdi = rsi (&vec), rsi = rax (first), rcx = r8 (size)
 *   0xb69fd           jmp __ZNSt3__16vectorIhNS_9allocatorIhEEE16__init_with_size...
 *                     ⇒ vector::__init_with_size(first, last, last-first)
 *
 * Post-condition: vec.begin points to a freshly-allocated buffer holding the [first,last)
 * bytes; vec.end == vec.begin + (last-first); vec.endcap >= vec.end.
 *
 * NB: this port receives `first`/`last` as (Uint8Array, offset) pairs since JS has no raw
 * pointer arithmetic; the FCP interface is `uint8_t const*` and the effective range is
 * `[firstBuf[firstOff], firstBuf[firstOff + (lastOff-firstOff))`.
 */
export class PCICCTag {
  /** +0x00 — 4-char ICC tag signature (packed uint32). */
  signature: number = 0;

  /** +0x08 — inline std::vector<uint8_t>. Ctor initializes to empty null-triple, then
   *  __init_with_size fills it in. */
  vec: PCVectorUint8 = {
    storage: new Uint8Array(0),
    begin: 0,
    end: 0,
    endcap: 0,
  };

  constructor(
    signature: number,
    first: Uint8Array,
    firstOff: number,
    last: Uint8Array,
    lastOff: number,
  ) {
    // @0xb69d5 — signature = sig
    this.signature = signature >>> 0;
    // @0xb69e1-0xb69e8 — {begin, end, endcap} = {null, null, null} (redundant with our
    //   default-init but matches the exact instruction sequence).
    this.vec = { storage: new Uint8Array(0), begin: 0, end: 0, endcap: 0 };
    // @0xb69fd — vector::__init_with_size(first, last, last-first)
    const size = (lastOff - firstOff) >>> 0;
    vector_uint8_init_with_size(this.vec, first, firstOff, last, lastOff, size);
  }

  /**
   * `PCICCTag::reset(uint32_t signature)` — replace signature and clear the byte buffer
   * WITHOUT freeing capacity (end = begin).
   * @ProCore 0x00000000000b6a02  (__ZN8PCICCTag5resetEj)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCICCTag.reset.s):
   *   0xb6a06  movl %esi, (%rdi)                                  — signature = sig
   *   0xb6a08  movq 0x8(%rdi), %rax                                — rax = begin
   *   0xb6a0c  movq %rax, 0x10(%rdi)                               — end = begin (clear-in-place)
   */
  reset(signature: number): void {
    // @0xb6a06 — signature = sig
    this.signature = signature >>> 0;
    // @0xb6a08-0xb6a0c — end = begin
    this.vec.end = this.vec.begin;
  }

  /**
   * `PCICCTag::getSignature() const` — return the raw 4-char signature.
   * @ProCore 0x00000000000b6a12  (__ZNK8PCICCTag12getSignatureEv)
   *
   * DECODE:
   *   0xb6a16  movl (%rdi), %eax                                    — return *(this+0)
   */
  getSignature(): number {
    // @0xb6a16
    return this.signature >>> 0;
  }

  /**
   * `PCICCTag::setSignature(uint32_t)` — overwrite the signature, no other state change.
   * @ProCore 0x00000000000b6a1a  (__ZN8PCICCTag12setSignatureEj)
   *
   * DECODE:
   *   0xb6a1e  movl %esi, (%rdi)                                    — *(this+0) = sig
   */
  setSignature(signature: number): void {
    // @0xb6a1e
    this.signature = signature >>> 0;
  }

  /**
   * `PCICCTag::empty() const` — true iff begin == end.
   * @ProCore 0x00000000000b6a22  (__ZNK8PCICCTag5emptyEv)
   *
   * DECODE:
   *   0xb6a26  movq 0x8(%rdi), %rax                                 — rax = begin
   *   0xb6a2a  cmpq 0x10(%rdi), %rax                                 — cmp end
   *   0xb6a2e  sete %al                                              — set eq
   */
  empty(): boolean {
    // @0xb6a26-0xb6a2e
    return this.vec.begin === this.vec.end;
  }

  /**
   * `PCICCTag::data()` and `PCICCTag::data() const` — return the raw byte pointer (`begin`).
   * @ProCore 0x00000000000b6a34  (__ZN8PCICCTag4dataEv)      — non-const overload
   * @ProCore 0x00000000000b6a3e  (__ZNK8PCICCTag4dataEv)     — const overload, bit-identical
   *
   * DECODE:
   *   0xb6a38 / 0xb6a42  movq 0x8(%rdi), %rax                       — return *(this+0x8)
   *
   * Note: both overloads share one body in the TS port; the C++-level const distinction
   * is expressed in the type system where callers hold the tag.
   */
  data(): { storage: Uint8Array; offset: number } {
    // @0xb6a38
    return { storage: this.vec.storage, offset: this.vec.begin };
  }

  /**
   * `PCICCTag::size() const` — byte-count of the tag data (end - begin).
   * @ProCore 0x00000000000b6a48  (__ZNK8PCICCTag4sizeEv)
   *
   * DECODE:
   *   0xb6a4c  movq 0x10(%rdi), %rax                                 — rax = end
   *   0xb6a50  subq 0x8(%rdi), %rax                                   — rax -= begin
   *
   * Because element size is 1 byte, the pointer difference IS the size in units — no
   * divide is emitted.
   */
  size(): number {
    // @0xb6a4c-0xb6a50
    return (this.vec.end - this.vec.begin) >>> 0;
  }

  /**
   * `PCICCTag::resize(unsigned long newSize)` — set size to `newSize`, growing via
   * `__append` (zero-fill) or shrinking by moving `end`.
   * @ProCore 0x00000000000b6a56  (__ZN8PCICCTag6resizeEm)
   *
   * DECODE:
   *   0xb6a5a  rcx = *(this+0x8)                                     — begin
   *   0xb6a5e  rdx = *(this+0x10)                                     — end
   *   0xb6a62  subq %rcx, %rdx                                        — rdx = end - begin = curSize
   *   0xb6a65  rax = rsi = newSize
   *   0xb6a68  subq %rdx, %rax                                        — rax = newSize - curSize
   *   0xb6a6b  jbe 0xb6a7a                                             — if newSize <= curSize skip
   *   0xb6a6d  rdi = rdi + 0x8                                         — &vec
   *   0xb6a71  rsi = rax                                                — delta
   *   0xb6a75  jmp vector::__append(delta)                              — grow by delta zeros
   *   ; SHRINK OR EQUAL branch:
   *   0xb6a7a  jae 0xb6a83                                              — if newSize == curSize done
   *   0xb6a7c  rcx = rcx + rsi                                          — begin + newSize
   *   0xb6a7f  movq %rcx, 0x10(%rdi)                                    — end = begin + newSize
   *
   * The pointer arith uses `newSize - curSize` unsigned to decide grow vs shrink via the
   * jbe/jae flag pair: jbe covers <= (borrow OR zero); the FOLLOWING jae covers == (zero
   * only). Structurally: grow, no-op, or shrink.
   */
  resize(newSize: number): void {
    // @0xb6a5a-0xb6a62 — curSize = end - begin
    const curSize = (this.vec.end - this.vec.begin) >>> 0;
    // @0xb6a65-0xb6a68 — delta = newSize - curSize (unsigned)
    const n = newSize >>> 0;
    const delta = (n - curSize) >>> 0;
    // @0xb6a6b — jbe: taken when newSize <= curSize
    if (n > curSize) {
      // @0xb6a6d-0xb6a75 — grow
      vector_uint8_append(this.vec, delta);
      return;
    }
    // @0xb6a7a — jae: taken when newSize >= curSize (in the fall-through the equal case
    // and less-than case are disambiguated). For newSize == curSize we do nothing.
    if (n === curSize) {
      return;
    }
    // @0xb6a7c-0xb6a7f — shrink: end = begin + newSize
    this.vec.end = (this.vec.begin + n) >>> 0;
  }

  /**
   * `PCICCTag::clear()` — set end = begin (retain capacity).
   * @ProCore 0x00000000000b6a86  (__ZN8PCICCTag5clearEv)
   *
   * DECODE:
   *   0xb6a8a  movq 0x8(%rdi), %rax                                    — rax = begin
   *   0xb6a8e  movq %rax, 0x10(%rdi)                                    — end = begin
   */
  clear(): void {
    // @0xb6a8a-0xb6a8e
    this.vec.end = this.vec.begin;
  }

  /**
   * `PCICCTag::operator[](size_t i)` and `operator[](size_t i) const` — return
   * `begin + i` (a raw pointer, i.e. the address of element i). Both overloads share
   * the same three-instruction body.
   * @ProCore 0x00000000000b6a94  (__ZN8PCICCTagixEm)
   * @ProCore 0x00000000000b6aa2  (__ZNK8PCICCTagixEm)  — const twin, bit-identical
   *
   * DECODE:
   *   0xb6a98  movq %rsi, %rax                                          — rax = i
   *   0xb6a9b  addq 0x8(%rdi), %rax                                      — rax += begin
   *   ; returns rax = begin + i
   *
   * In this port we return a { vec, offset } cursor that models the raw pointer at
   * `vec.storage[begin + i]`. Callers reading a value use `vec.storage[offset]`; callers
   * writing use `vec.storage[offset] = v`. The offset itself is `begin + i` and is a
   * uint32 (masked by unsigned arithmetic to match the 64-bit lea sematics on positive
   * i values encountered in practice).
   */
  index(i: number): PCICCTagByteRef {
    // @0xb6a98-0xb6a9b
    const offset = (this.vec.begin + (i >>> 0)) >>> 0;
    return { vec: this.vec, offset };
  }

  /**
   * `PCICCTag::push_back(uint8_t v)` — vector-append one byte.
   * @ProCore 0x00000000000b6ab0  (__ZN8PCICCTag9push_backEh)
   *
   * DECODE:
   *   0xb6ab0-0xb6ab4  prologue with 0x10-byte local frame
   *   0xb6ab8           rax = &tmpByte    (on stack, at rbp - 1)
   *   0xb6abc           movb %sil, (%rax)                              — tmpByte = v (low byte)
   *   0xb6abf           rdi = rdi + 0x8                                — &vec
   *   0xb6ac3           rsi = rax                                       — &tmpByte
   *   0xb6ac6           callq vector::push_back(uint8_t const&)         — push_back(&tmpByte)
   *
   * i.e. the byte is passed by REFERENCE (via a stack temporary) — libc++'s push_back
   * takes a const reference, not a value. We faithfully pass a wrapped uint8 into the
   * (throwing) stub so the interface matches.
   */
  push_back(v: number): void {
    // @0xb6abc — tmp = v & 0xff
    const tmp = v & 0xff;
    // @0xb6abf-0xb6ac6 — vector::push_back(&tmp)
    vector_uint8_push_back(this.vec, tmp);
  }
}
