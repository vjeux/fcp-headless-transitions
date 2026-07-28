// PCSerializerWriteStream — abstract "write stream" base for the Pro Codec
// serializer framework (Ozone).
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/PCSerializerWriteStream.*.s):
//   reset()                          @0x0004b250  (__ZN23PCSerializerWriteStream5resetEv)
//   isHashStream()                   @0x0004b260  (__ZN23PCSerializerWriteStream12isHashStreamEv)
//   ~PCSerializerWriteStream (D2)    @0x006daef0  (base dtor — ICF-folded with D0; resolves to the same symbol name)
//   ~PCSerializerWriteStream (D0)    @0x006daf00  (__ZN23PCSerializerWriteStreamD0Ev — body is `ud2`)
//
// Callees / vtable refs: NONE. All four methods are self-contained.
//
// Bodies (from otool -tvV, x86_64 slice):
//
//   0x4b250  reset:
//     pushq  %rbp
//     movq   %rsp, %rbp
//     popq   %rbp
//     retq
//     -> empty frame, returns void. Base class provides a do-nothing default.
//
//   0x4b260  isHashStream:
//     pushq  %rbp
//     movq   %rsp, %rbp
//     xorl   %eax, %eax           // return 0
//     popq   %rbp
//     retq
//     -> returns false. Base class default: "I am not a hash stream".
//
//   0x6daf00  ~PCSerializerWriteStream (D0 / deleting dtor):
//     pushq  %rbp
//     movq   %rsp, %rbp
//     ud2                          // undefined instruction: unreachable
//     -> abstract-class marker: the deleting form should never be dispatched
//        for the base type. If a caller ever hits it, `ud2` raises SIGILL.
//        In TS we surface it as a throw so the same "should be unreachable"
//        contract is preserved (see destroyAndDelete below).
//
//   0x6daef0  ~PCSerializerWriteStream (D2 / base dtor):
//     The resolver returns the same demangled name for 0x6daef0 and
//     0x6daf00, and the raw disasm dumper only produces a single symbol at
//     0x6daf00. In FCP's LTO-linked binary these two ABI entry points are
//     ICF-folded onto the same body (the trivial `ud2` stub is a common ICF
//     tail). Both entries end at the same illegal-instruction trap, so we
//     model both TS entry points identically.

/**
 * PCSerializerWriteStream — abstract base for the Ozone Pro Codec
 * serializer's write-stream family. Concrete subclasses override `reset`,
 * `isHashStream`, and the destructor; the base itself provides only the
 * no-op / false-returning defaults captured here.
 *
 * The class has no data members visible from these four method bodies
 * (nothing on `this` is touched — no `rdi` reads other than the C++ ABI
 * `this` pointer implicit in `pushq %rbp; movq %rsp,%rbp; …`). Concrete
 * subclasses carry their own state.
 */
export class PCSerializerWriteStream {
  /**
   * PCSerializerWriteStream::reset() @0x0004b250 (Ozone).
   *
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   popq  %rbp
   *   retq
   *
   * Empty prologue+epilogue, returns void. The base class defines `reset`
   * as a no-op default; hash / buffer / file subclasses override this.
   */
  reset(): void {
    // (empty body — matches the empty stack frame at @0x0004b250)
  }

  /**
   * PCSerializerWriteStream::isHashStream() @0x0004b260 (Ozone).
   *
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   xorl  %eax, %eax         // return 0
   *   popq  %rbp
   *   retq
   *
   * Always returns false in the base class. Only hash-stream subclasses
   * (e.g. any CRC / digest write-stream) will override this to return true.
   */
  isHashStream(): boolean {
    // xorl %eax, %eax  ->  return 0 (false).
    return false;
  }

  /**
   * PCSerializerWriteStream::~PCSerializerWriteStream() @0x006daef0 — base
   * (D2) destructor. See file-header note on ICF folding with D0. TS has no
   * destructors; a call here is a lifecycle no-op mirroring the abstract-
   * class contract (the compiler-emitted body is the illegal-instruction
   * trap shared with D0).
   */
  destroy(): void {
    // ud2 @0x006daef0 (folded with D0). Unreachable in a well-formed program.
    // We leave this as a lifecycle no-op rather than throwing: some callers
    // invoke the base dtor explicitly during subclass tear-down chains, and
    // those paths are safe as long as no virtual dispatch tries to *reach*
    // the abstract slot. The deleting-form entry point is where the trap
    // fires (see destroyAndDelete below).
  }

  /**
   * PCSerializerWriteStream::~PCSerializerWriteStream() @0x006daf00 — the
   * deleting (D0) destructor, which the Itanium C++ ABI generates for any
   * class with a virtual dtor. Body is a single `ud2` illegal instruction:
   *
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   ud2
   *
   * This is the compiler's marker for an abstract base whose deleting form
   * must never actually be dispatched: if the vtable slot for D0 is ever
   * resolved to *this* symbol at runtime, something has gone wrong (a
   * `delete p;` on a `PCSerializerWriteStream*` when no concrete override
   * was linked). Mirror the trap in TS with a throw citing the address.
   */
  destroyAndDelete(): never {
    // ud2 @0x006daf00 — unreachable in a well-formed program.
    throw new Error(
      'PCSerializerWriteStream::~PCSerializerWriteStream() D0 is unreachable (@0x006daf00 ud2) — abstract base',
    );
  }
}
