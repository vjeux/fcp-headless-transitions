// OZChannelRef — ProChannel's smart-ref helper for OZChannel channels.
//
// This file ONLY transcribes ONE method today: the D1 destructor
// `OZChannelRef::~OZChannelRef()` @ProChannel 0x4abb4. All other members
// (ctor(s), getChannel, setChannel, retain/release, operator=, etc.) are
// SEPARATE ledger units and will be added to this class file as their own
// claims land, per the "one class per file" rule.
//
// Cross-reference: another already-ported file
// (raw-port/src/channels/OZChannelUndo.ts) declares an EXTERN STUB for
// `OZChannelRef::~OZChannelRef()` at the Ozone framework's import stub
// address 0x6dd71c (`OZChannelRef_dtor_stub`). That stub is Ozone's
// PLT-style tail-jmp indirection into ProChannel — it is a SEPARATE
// symbol (Ozone's __stubs section) from the actual body ported here
// (ProChannel's __text @0x4abb4). This file transcribes the real body;
// the Ozone-side stub is a per-framework alias that will be resolved
// when Ozone's linker layer is modelled. Nothing here overlaps or
// conflicts with the OZChannelUndo stub — they are two different
// symbols at two different addresses in two different frameworks.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN12OZChannelRefD1Ev.s
//
// Full 11-line disassembly of the CLAIMED method (verbatim):
//
//   __ZN12OZChannelRefD1Ev:
//   0x4abb4  pushq   %rbp
//   0x4abb5  movq    %rsp, %rbp
//   0x4abb8  testb   $0x1, (%rdi)                    ; test low bit of *this
//   0x4abbb  jne     0x4abbf                         ; if bit0 set -> free
//   0x4abbd  popq    %rbp
//   0x4abbe  retq                                     ; bit0 clear: no-op
//   0x4abbf  movq    0x10(%rdi), %rdi                ; rdi = this->owned
//   0x4abc3  popq    %rbp
//   0x4abc4  jmp     0xace04                         ## symbol stub for: __ZdlPv
//   0x4abc9  nop
//
// SEMANTIC SUMMARY
//   `OZChannelRef` carries a "tagged ownership" flag in the low bit of
//   its first word:
//     - bit 0 CLEAR at (%rdi) => this ref is a NON-OWNING view; the
//       destructor is a pure no-op (early return @0x4abbe).
//     - bit 0 SET at (%rdi)   => this ref OWNS a heap allocation whose
//       pointer is stored at instance +0x10. The dtor tail-jumps to
//       `operator delete(void*)` on that pointer, freeing the owned
//       block. Nothing else is touched — the ref itself is not scrubbed;
//       Itanium ABI D1 is expected to leave the storage valid-but-empty
//       for the surrounding scope to reclaim.
//
//   This "low-bit flag on the header word + owned pointer at +0x10"
//   pattern is very close to the OZChannelUndo layout documented in the
//   sibling file (raw-port/src/channels/OZChannelUndo.ts) which also
//   holds a "raw-ref | owned-copy" discriminator plus a pointer at +0x08
//   / +0x10. Both use the same style of ownership discipline; the
//   details differ per class.
//
// STRUCT LAYOUT DECODED FROM THIS BODY
//   OZChannelRef instance layout (partial — only what THIS function touches):
//     +0x00  { uint8_t ownsCopy : 1; ... : 7; ... }
//                                   // bit 0 tested @0x4abb8; the rest
//                                   // of the byte and the remaining
//                                   // header bytes are untouched here.
//     +0x08  ... (unknown to this dtor — likely refcount / vtable
//                 pointer / raw channel pointer; separate claims will
//                 extend this layout)
//     +0x10  void* owned          // read @0x4abbf; passed to
//                                   // operator delete. Present only
//                                   // when bit 0 of +0x00 is set.
//
// DEPENDENCIES
//   Direct in-scope callees: NONE. The one tail-jmp target is
//   `__ZdlPv` — libc++ `operator delete(void*)` @ProChannel imported
//   stub 0xace04. TRUE out-of-scope extern (C++ runtime allocator).
//   Modelled as a boundary stub per policy (see PORTING_SPEC.md — same
//   treatment as HGMemory's __Znwm/__ZdlPv callsites).
//
// Symbols ported here (mangled -> address):
//   * __ZN12OZChannelRefD1Ev  —  OZChannelRef::~OZChannelRef()  @ProChannel 0x4abb4
//     (Itanium ABI D1 — complete-object dtor; ordinary destructor).
//   * __ZN12OZChannelRefC1Ev  —  OZChannelRef::OZChannelRef()   @ProChannel 0x4c60a
//     (Itanium ABI C1 — complete-object DEFAULT ctor.)
//
// ---------------------------------------------------------------------------
// DEFAULT CTOR (C1) @0x4c60a — full 7-line disassembly (verbatim), from
// raw-port/re/disasm/ProChannel.__ZN12OZChannelRefC1Ev.s:
//
//   __ZN12OZChannelRefC1Ev:
//   0x4c60a  pushq   %rbp
//   0x4c60b  movq    %rsp, %rbp
//   0x4c60e  xorps   %xmm0, %xmm0            ; xmm0 = 16 zero bytes
//   0x4c611  movups  %xmm0, (%rdi)           ; zero instance +0x00..+0x0f
//   0x4c614  movq    $0x0, 0x10(%rdi)        ; zero instance +0x10..+0x17
//   0x4c61c  popq    %rbp
//   0x4c61d  retq
//
// Two stores, 0x18 bytes total — exactly the libc++ std::string body this
// class already models (see the `ownsCopy`/`longSize`/`shortSize`/`owned`/
// `shortData` fields, decoded by the D1 dtor and operator== ports above). The
// resulting state is the canonical EMPTY SHORT-MODE string:
//   +0x00 byte0 = 0  -> SSO tag bit 0 CLEAR (short mode) and short size
//                       (byte0 >> 1) = 0
//   +0x01..+0x17     -> the 23-byte inline character buffer, all zero
//   +0x08            -> 0 (only read as the long-mode size, which this state
//                       never selects)
//   +0x10            -> 0 (the long-mode data pointer / the dtor's `owned`,
//                       so a default-constructed ref is NON-OWNING and its
//                       D1 dtor @0x4abb8 takes the no-op path)
// There is NO call of any kind in the body: zero in-scope callees, zero
// externs, no allocation (`__Znwm` is absent — an empty libc++ string never
// allocates), no indirect or virtual dispatch.
//
// `OZChannelRef::OZChannelRef()` [C2] @0x4c5f6 is a SEPARATE symbol with a
// byte-identical body (`xorps` @0x4c5fa, `movups %xmm0,(%rdi)` @0x4c5fd,
// `movq $0x0,0x10(%rdi)` @0x4c600). It is its own ledger unit and is NOT
// ported here; it is cited only as corroboration of the 0x18-byte body size.

/**
 * `operator delete(void*)` — the C++ deallocator. Imported by ProChannel
 * at stub @0xace04 (`## symbol stub for: __ZdlPv`). TRUE out-of-scope
 * extern (libc++ runtime; not one of the five FCP frameworks).
 *
 * In this port there is no libc++ allocator, so a faithful raise here
 * is the correct behaviour: any owning dtor reaching this point is
 * asserting that a heap block should be freed, and we cannot honour
 * that without a JS-side allocator model.
 */
function operator_delete_stub(_p: unknown): void {
  throw new Error(
    "operator delete(void*) __ZdlPv @ProChannel imported stub 0xace04 " +
      "(libc++ runtime allocator — TRUE out-of-scope extern; not yet transcribed)",
  );
}

/**
 * A minimal accessor over the tagged "ownership flag" byte at
 * OZChannelRef instance offset +0x00. Only bit 0 is examined by the D1
 * dtor (see body); bits 1..7 of that byte and any surrounding header
 * fields are OPAQUE to this file and will be decoded by other members'
 * claims. We model this as a discrete field pair so the flag test and
 * the owned-pointer load are faithful, without inventing an entire
 * byte-array representation for the struct.
 */
export interface OZChannelRefHeader {
  /** @ProChannel instance +0x00 low bit; tested by D1 dtor @0x4abb8.
   *  Semantics: 1 = OZChannelRef owns the block at +0x10 (dtor must
   *  operator-delete it); 0 = non-owning view (dtor is a no-op). */
  ownsCopy: boolean;

  /** @ProChannel instance +0x10; read only when `ownsCopy === true`
   *  (dtor path @0x4abbf..0x4abc4). Pointer to the heap-allocated
   *  channel copy that this ref owns. The exact type of the pointee is
   *  the responsibility of the OZChannelRef ctor claims (not decoded
   *  here); `unknown` is faithful to what the dtor sees — an opaque
   *  void* on its way to operator delete. */
  owned: unknown;
}

/**
 * `OZChannelRef` — ProChannel smart-ref (partial port).
 *
 * ONLY the D1 destructor is transcribed here. All other members are
 * SEPARATE ledger symbols.
 *
 * Struct layout (partial, decoded from ported members only):
 *   +0x00  ownsCopy flag (low bit of a byte) — tested by D1.
 *   +0x10  owned pointer                     — freed by D1 when owned.
 */
export class OZChannelRef implements OZChannelRefHeader {
  /** @ProChannel instance +0x00 (bit 0).
   *
   * Interpreted by BOTH ~OZChannelRef() and operator== as the libc++
   * std::string SSO discriminator: bit 0 SET = "long" representation
   * (heap-allocated, size at +0x08, data pointer at +0x10). bit 0 CLEAR
   * = "short" representation (size in the upper 7 bits of byte 0, data
   * inline starting at &this+1). See the operator== docblock below for
   * the full pattern. The dtor treats this bit as "owns a heap copy"
   * (=> free +0x10); operator== treats it as "read size/data from
   * long-mode vs short-mode fields". Same bit, same meaning under
   * different names — kept as the field `ownsCopy` for continuity with
   * the D1 dtor's already-ported vocabulary.
   */
  ownsCopy: boolean = false;

  /** @ProChannel instance +0x08.
   *
   * Long-mode SIZE (u64), read by operator== @0x4c893 as
   *   `movq 0x8(%rdi), %rdx  ; rdx = long-mode size in bytes`.
   * Only meaningful when `ownsCopy` (bit 0 of byte 0) is SET. In short
   * mode, this slot is part of the inline character storage and is not
   * read as a size. Zero when unused. */
  longSize: bigint = 0n;

  /** @ProChannel instance +0x00, upper 7 bits.
   *
   * Short-mode SIZE (u8 >> 1), read by operator== @0x4c899..0x4c89b as
   *   `movl %eax,%edx ; shrl %edx  ; edx = ((byte0 & 0xff) >> 1)`.
   * Only meaningful when `ownsCopy` is CLEAR. Range 0..0x7f (0..127).
   *
   * Modelled as a separate field so it can be non-destructively added
   * to the existing class layout (the D1 dtor doesn't read this and is
   * unaffected — see class header note about "one bit, two names").
   * Kept in sync with the low bit of the same byte: `ownsCopy` is bit
   * 0, `shortSize` is the value shifted from bits 1..7. */
  shortSize: number = 0;

  /** @ProChannel instance +0x10.
   *
   * Long-mode DATA pointer (u8*), read by operator== @0x4c8ba as
   *   `movq 0x10(%rdi), %rdi  ; rdi = long-mode data pointer`.
   * Also the value passed to operator delete by ~OZChannelRef when
   * `ownsCopy` is SET (kept named `owned` for continuity). Modelled
   * here as `unknown` because the D1 dtor treats it as a bare
   * `void*` on its way to operator delete. In operator== it is
   * subsequently passed to `_memcmp(long_data_a, long_data_b, size)`,
   * so the runtime value must be a byte buffer with valid contents. */
  owned: unknown = null;

  /** @ProChannel instance +0x01.
   *
   * Short-mode INLINE DATA (up to 23 bytes on x86_64 std::string),
   * modelled here as an optional u8 buffer. Only meaningful when
   * `ownsCopy` is CLEAR. Read by operator== @0x4c8c3 as
   *   `incq %rdi  ; rdi = &this+1 = &inline_bytes[0]`.
   * Together with `shortSize` this is what operator== `_memcmp`s
   * against the peer's short-mode buffer. Null when the ref is
   * long-mode. */
  shortData: Uint8Array | null = null;

  /**
   * `OZChannelRef::OZChannelRef()` @ProChannel 0x4c60a
   * (__ZN12OZChannelRefC1Ev). Itanium ABI C1 (complete-object ctor) —
   * the DEFAULT constructor.
   *
   * Faithful transcription of the 7-line disasm quoted in the file
   * header. The whole body is two stores that zero the 0x18-byte
   * libc++ std::string instance, leaving the canonical EMPTY
   * SHORT-MODE string:
   *
   *   0x4c60a  pushq  %rbp                 ; frame setup (no TS counterpart)
   *   0x4c60b  movq   %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x4c60e  xorps  %xmm0, %xmm0         ; xmm0 = 16 zero bytes
   *   0x4c611  movups %xmm0, (%rdi)        ; zero +0x00..+0x0f
   *   0x4c614  movq   $0x0, 0x10(%rdi)     ; zero +0x10..+0x17
   *   0x4c61c  popq   %rbp                 ; frame teardown (no TS counterpart)
   *   0x4c61d  retq
   *
   * Field-by-field, the two stores land on exactly the slots this class
   * already models (nothing else is touched, and no field is removed):
   *   +0x00 bit 0     -> `ownsCopy = false`  (short mode; the D1 dtor's
   *                      `testb $0x1,(%rdi)` @0x4abb8 then takes the
   *                      no-op path, so a default ref owns nothing)
   *   +0x00 bits 1..7 -> `shortSize = 0`
   *   +0x08           -> `longSize = 0n`     (same 16-byte store)
   *   +0x10           -> `owned = null`      (the 8-byte store @0x4c614)
   *   +0x01..+0x17    -> `shortData` = 23 zero bytes; in short mode
   *                      those are the inline character bytes, and both
   *                      stores together cover all of them.
   *
   * No callee of any kind: no in-scope call, no extern, no allocation
   * (`__Znwm` does not appear — an empty libc++ string never
   * allocates), no indirect or virtual dispatch.
   */
  constructor() {
    // @0x4c60e / @0x4c611  xorps %xmm0,%xmm0 ; movups %xmm0,(%rdi)
    //   — one 16-byte zero store covering +0x00..+0x0f.
    this.ownsCopy = false; // +0x00 bit 0 (SSO tag: 0 => short mode)
    this.shortSize = 0; // +0x00 bits 1..7 (short size = byte0 >> 1)
    this.longSize = 0n; // +0x08 (long-mode size word)

    // @0x4c614  movq $0x0,0x10(%rdi) — the second store, +0x10..+0x17.
    this.owned = null; // +0x10 (long-mode data pointer / owned block)

    // +0x01..+0x17 — the 23-byte inline buffer covered by the two stores
    // above; zeroed here so the short-mode representation is complete.
    this.shortData = new Uint8Array(23);
  }

  /**
   * `OZChannelRef::~OZChannelRef()` @ProChannel 0x4abb4
   * (__ZN12OZChannelRefD1Ev). Itanium ABI D1 (complete-object dtor).
   *
   * Faithful transcription of the 11-line disasm quoted in the file
   * header. Body:
   *
   *   if (this->ownsCopy) {
   *     operator delete(this->owned);   // tail-jmp @0x4abc4
   *   }
   *   // otherwise no-op (early return @0x4abbe)
   */
  destroy(): void {
    // @0x4abb4–0x4abb5: prologue (rbp frame, no callee-saves needed).

    // @0x4abb8:      testb $0x1, (%rdi)   ; test bit 0 of this->{+0x00}.
    // @0x4abbb:      jne   0x4abbf        ; if SET, jump into the free path.
    // @0x4abbd–e:    fall-through -> popq %rbp ; retq (no-op dtor).
    if (!this.ownsCopy) {
      // Non-owning view: nothing to free.
      return;
    }

    // @0x4abbf: movq 0x10(%rdi), %rdi  ; rdi = this->owned (heap pointer).
    // @0x4abc3: popq %rbp              ; tear down the frame BEFORE the tail-jmp.
    // @0x4abc4: jmp  0xace04           ## symbol stub for operator delete(void*).
    //           Tail-call — control never returns here (the jmp is not a
    //           callq). Faithful raising stub — see operator_delete_stub.
    operator_delete_stub(this.owned);
    // (unreachable in the faithful port; the tail-jmp does not return.)
  }

  /**
   * `OZChannelRef::operator==(OZChannelRef const& rhs) const`
   *   @ProChannel 0x4c88c
   *   (__ZNK12OZChannelRefeqERKS_)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZNK12OZChannelRefeqERKS_.s):
   *
   *   0x4c88c  movzbl  (%rdi), %eax             ; eax = byte 0 of *this  (SSO tag byte)
   *   0x4c88f  testb   $0x1, %al                ; is_long_a = (byte0 & 1)
   *   0x4c891  je      0x4c899                  ; if !is_long: use short branch
   *   0x4c893  movq    0x8(%rdi), %rdx          ; long: rdx = size_a = *(u64*)(this+0x8)
   *   0x4c897  jmp     0x4c89d
   *   0x4c899  movl    %eax, %edx               ; short: rdx = byte0
   *   0x4c89b  shrl    %edx                     ;   >>= 1        (short size 0..127)
   *   0x4c89d  movzbl  (%rsi), %ecx             ; ecx = byte 0 of *rhs
   *   0x4c8a0  testb   $0x1, %cl                ; is_long_b
   *   0x4c8a3  je      0x4c8ab
   *   0x4c8a5  movq    0x8(%rsi), %r8           ; long: r8 = size_b = *(u64*)(rhs+0x8)
   *   0x4c8a9  jmp     0x4c8b1
   *   0x4c8ab  movl    %ecx, %r8d               ; short: r8 = byte0_b >> 1
   *   0x4c8ae  shrl    %r8d
   *   0x4c8b1  cmpq    %r8, %rdx                ; flags = size_a - size_b
   *   0x4c8b4  jne     0x4c8c0                  ; sizes differ -> return false
   *   0x4c8b6  testb   $0x1, %al                ; is_long_a (recheck AL from @0x4c88c)
   *   0x4c8b8  je      0x4c8c3                  ; short: inline-buffer path
   *   0x4c8ba  movq    0x10(%rdi), %rdi         ; long : rdi = data_a = *(void**)(this+0x10)
   *   0x4c8be  jmp     0x4c8c6
   *   0x4c8c0  xorl    %eax, %eax               ; sizes differ:
   *   0x4c8c2  retq                             ;   return false
   *   0x4c8c3  incq    %rdi                     ; short: rdi = &this + 1  (inline data)
   *   0x4c8c6  testb   $0x1, %cl                ; is_long_b (recheck CL from @0x4c89d)
   *   0x4c8c9  je      0x4c8d1
   *   0x4c8cb  movq    0x10(%rsi), %rsi         ; long : rsi = data_b = *(void**)(rhs+0x10)
   *   0x4c8cf  jmp     0x4c8d4
   *   0x4c8d1  incq    %rsi                     ; short: rsi = &rhs + 1
   *   0x4c8d4  pushq   %rbp                     ; NB: prologue lives HERE (deferred until we
   *   0x4c8d5  movq    %rsp, %rbp               ;      actually need to call an extern)
   *   0x4c8d8  callq   _memcmp                  ; eax = _memcmp(data_a, data_b, size)
   *   0x4c8dd  testl   %eax, %eax
   *   0x4c8df  sete    %al                      ; return (memcmp == 0)
   *   0x4c8e2  popq    %rbp
   *   0x4c8e3  retq
   *
   * SEMANTICS: byte-wise equality of two OZChannelRef strings, matching
   * libc++'s std::string layout (SSO — Short-String Optimization):
   *
   *   size(x) = (byte0(x) & 1) ? *(u64*)(&x + 0x08)   // long
   *                            : (byte0(x) >> 1)      // short
   *   data(x) = (byte0(x) & 1) ? *(void**)(&x + 0x10) // long: heap ptr
   *                            : (&x + 1)             // short: inline
   *   operator==(a, b) := size(a) == size(b) && memcmp(data(a), data(b), size) == 0
   *
   * The SSO discriminator is the SAME "low bit of byte 0" that the D1
   * dtor above tests as `ownsCopy` — the two ports agree on the layout
   * (see the `ownsCopy` field's docblock). Because operator== reads
   * BOTH the size (at +0x8 or byte0>>1) AND the data pointer (at +0x10
   * or &this+1) that the dtor didn't need, this file now stores those
   * as explicit fields (`longSize`, `shortSize`, `shortData`, and the
   * existing `owned` for long-mode data). No existing dtor behaviour
   * is changed.
   *
   * EXTERN:
   *   `_memcmp` (libc) @ProChannel imported stub 0xacefa.
   *   TRUE out-of-scope extern (libc); modelled at the boundary as a
   *   faithful byte-buffer comparison. See operator== body for the
   *   inline modelling — we compare the two byte views directly rather
   *   than dispatching through a stub, because the JS `Uint8Array`
   *   equality is the semantics `_memcmp(a,b,n)==0` describes.
   *
   * DEPENDENCIES: none in-scope. (`_memcmp` is a libc extern, per the
   * boundary policy in PORTING_SPEC.md.)
   */
  equals(rhs: OZChannelRef): boolean {
    // @0x4c88c..0x4c891 — read is_long for lhs.
    const isLongA = this.ownsCopy;
    // @0x4c893..0x4c89b — pick sizeA: long path reads +0x08; short path
    // reads (byte0 & 0xff) >> 1.
    const sizeA: bigint = isLongA ? this.longSize : BigInt(this.shortSize);

    // @0x4c89d..0x4c8ae — same for rhs.
    const isLongB = rhs.ownsCopy;
    const sizeB: bigint = isLongB ? rhs.longSize : BigInt(rhs.shortSize);

    // @0x4c8b1..0x4c8b4  cmpq %r8, %rdx ; jne 0x4c8c0
    // @0x4c8c0..0x4c8c2  xorl %eax, %eax ; retq   -> return false
    if (sizeA !== sizeB) {
      return false;
    }

    // @0x4c8b6..0x4c8be — pick data pointer for lhs. Long: +0x10 (owned).
    // Short: &this + 1 (shortData in the port).
    const dataA: Uint8Array | null = isLongA
      ? (this.owned as Uint8Array | null)
      : this.shortData;
    // @0x4c8c6..0x4c8d1 — same for rhs.
    const dataB: Uint8Array | null = isLongB
      ? (rhs.owned as Uint8Array | null)
      : rhs.shortData;

    // @0x4c8d4..0x4c8e3 — memcmp(dataA, dataB, size) then sete on the
    // result. Size zero => _memcmp returns 0 and the strings are equal
    // regardless of what dataA/dataB point at (the disasm doesn't
    // null-check the pointers; libc `memcmp(x, y, 0)` returns 0
    // unconditionally). Match that with the size==0 early accept.
    const n: number = Number(sizeA); // sizeA==sizeB, checked above
    if (n === 0) {
      return true;
    }

    // If either buffer is null (only possible in a well-formed ref if
    // the runtime state is torn), fall back to strict inequality so
    // the port can't silently claim equality on invalid input. The
    // disasm doesn't null-check either — a null pointer would fault
    // inside _memcmp — so this branch is defensive-only, not a
    // decode of a real code path.
    if (dataA === null || dataB === null) {
      return false;
    }

    // @0x4c8d8..0x4c8df  _memcmp(dataA, dataB, n) ; sete %al
    // Faithful boundary model for libc _memcmp: byte-wise equality of
    // the first `n` bytes of the two buffers.
    for (let i = 0; i < n; i++) {
      if (dataA[i] !== dataB[i]) {
        return false;
      }
    }
    return true;
  }
}
