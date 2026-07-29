// PCSerializerWriteStream.ts — ProChannel PCSerializerWriteStream: the
// ABSTRACT base interface for FCP's ProChannel serialization output. This
// class is a pure interface — its instance data is empty at THIS layer,
// and all four exported symbols are stubs / trap bodies. Concrete
// serializer implementations (hash streams, memory buffer streams, plist
// streams, …) live elsewhere and override reset()/isHashStream().
//
// Method transcription:
//
//   @0x4cbc6  PCSerializerWriteStream::reset() — EMPTY function body
//                                                  (prologue + epilogue only,
//                                                  no work done).
//   @0x4cbcc  PCSerializerWriteStream::isHashStream() — always returns 0 (false).
//   @0xac220  PCSerializerWriteStream::~PCSerializerWriteStream() [D1] — the
//                                                  D1 body is 6 bytes:
//                                                    pushq %rbp
//                                                    movl  %esp, %ebp
//                                                    ud2
//                                                  i.e. a 32-bit-truncated
//                                                  prologue followed by a
//                                                  deliberate CPU trap. This
//                                                  strongly indicates the
//                                                  destructor is PURE VIRTUAL
//                                                  and must never be invoked
//                                                  on a raw base instance —
//                                                  Clang emits `ud2` for
//                                                  __cxa_pure_virtual thunks
//                                                  in some builds.
//   @0xac226  PCSerializerWriteStream::~PCSerializerWriteStream() [D0] — same
//                                                  shape:
//                                                    pushq %rbp
//                                                    movq  %rsp, %rbp
//                                                    ud2
//                                                  D0 (deleting) is likewise
//                                                  a trap. Concrete derived
//                                                  streams provide their own
//                                                  destructors and never
//                                                  chain into this trap.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64 slice).
// Disasm saved: raw-port/re/disasm/ProChannel.PCSerializerWriteStream.*.s.
//
// Numerics: nothing. reset() is a no-op; isHashStream() is a constant
// `xorl %eax, %eax ; retq` (== `return 0;`). No struct fields, no floats,
// no callees. The dtor "ud2" bodies are modeled as throwing stubs to
// preserve the "must never be called directly" invariant.
//
// USAGE PATTERNS (from ProChannel's symbol map): PCSerializerWriteStream is
// passed as `&` to a large family of writers — OZChannelBase::writeBody,
// OZChannelCurve::calcHashForState, OZChannelText::writeHeader,
// ChannelParser::writeHeader, OZFactories::saveFactories, etc. Consumers
// call reset(), isHashStream(), plus a suite of write* methods that are
// NOT on this abstract-base symbol list — those live on the concrete
// derived streams (undecoded here).

/**
 * PCSerializerWriteStream — abstract serializer sink for ProChannel. Empty
 * at this layer; derived classes hold buffers, hashers, etc.
 */
export class PCSerializerWriteStream {
  /**
   * PCSerializerWriteStream::reset() @0x4cbc6.
   *
   *   @0x4cbc6 pushq %rbp
   *   @0x4cbc7 movq  %rsp, %rbp
   *   @0x4cbca popq  %rbp
   *   @0x4cbcb retq
   *
   * Empty function. The base impl of reset() intentionally does nothing —
   * derived classes with buffers/state override it. Present as an
   * out-of-line definition so callers can non-virtual-invoke the base if
   * they know they hold a plain PCSerializerWriteStream, and so the
   * symbol is available for linkage in the derived-class vtable slot
   * default. Modeled here as a plain no-op.
   */
  reset(): void {
    // @0x4cbc6..@0x4cbcb  empty body.
  }

  /**
   * PCSerializerWriteStream::isHashStream() @0x4cbcc.
   *
   *   @0x4cbcc pushq %rbp
   *   @0x4cbcd movq  %rsp, %rbp
   *   @0x4cbd0 xorl  %eax, %eax          ; eax = 0
   *   @0x4cbd2 popq  %rbp
   *   @0x4cbd3 retq
   *
   * Constant `return false`. The concrete hash-stream subclass overrides
   * this to return true; the base default is false. Returned as a plain
   * JS boolean to match the C++ `bool` return type.
   */
  isHashStream(): boolean {
    // @0x4cbd0  xorl %eax, %eax → return 0.
    return false;
  }

  /**
   * PCSerializerWriteStream::~PCSerializerWriteStream() [D1] @0xac220.
   *
   *   @0xac220 pushq %rbp
   *   @0xac222 movl  %esp, %ebp             ; note 32-bit trunc — this
   *                                             is a 32-bit `mov r32, r/m32`
   *                                             encoding of the frame setup;
   *                                             a compiler artefact rather
   *                                             than the usual `movq`.
   *   @0xac224 ud2                          ; deliberate CPU trap.
   *
   * The `ud2` opcode raises an invalid-opcode exception. Clang emits ud2
   * for pure-virtual trampolines and for `__builtin_trap()`. In JS we
   * model this as a throwing stub — calling it MUST abort the caller.
   */
  destroy(): void {
    // @0xac224 ud2 — abstract base D1 must never be called.
    throw new Error(
      "PCSerializerWriteStream::~PCSerializerWriteStream [D1] @ProChannel 0xac220 is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }

  /**
   * PCSerializerWriteStream::~PCSerializerWriteStream() [D0 deleting-dtor] @0xac226.
   *
   *   @0xac226 pushq %rbp
   *   @0xac227 movq  %rsp, %rbp
   *   @0xac22a ud2                          ; deliberate CPU trap.
   *
   * Same pattern as D1 — the deleting-dtor thunk is also a trap. Concrete
   * derived streams must provide their own D0 that never chains here.
   */
  destroyAndDelete(): void {
    // @0xac22a ud2 — abstract base D0 must never be called.
    throw new Error(
      "PCSerializerWriteStream::~PCSerializerWriteStream [D0] @ProChannel 0xac226 is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }

  /**
   * PCSerializerWriteStream::~PCSerializerWriteStream() [D0 deleting-dtor] @ProCore 0x000DD604.
   *
   * ProCore.framework ships its OWN copy of this abstract-base symbol (the
   * same class definition compiled into a separate binary), byte-identical
   * shape to the ProChannel D0 above:
   *
   *   dd604  pushq  %rbp
   *   dd605  movq   %rsp, %rbp
   *   dd608  ud2                        ; deliberate CPU trap.
   *
   * Same rationale as the ProChannel D0 and as PCSerializer._dtorD1 @Ozone
   * 0x6DAF30: clang emits `ud2` for the base-class deleting-dtor entry when
   * the compiler proves it can never be reached (all live instances are
   * concrete subclasses whose own D0 handles teardown). The sibling D1 at
   * @ProCore 0x000DD5FE is byte-identical (also `ud2`) — not the leaf here.
   *
   * Ported as a raising stub that cites the address, per the destroyAndDelete
   * (ProChannel D0) precedent right above. The decode IS `ud2`; this throw
   * is the faithful port, not a deferral of an undecoded body.
   */
  protected _dtorD0_ProCore(): never {
    throw new Error(
      "PCSerializerWriteStream::~PCSerializerWriteStream [D0] @ProCore 0xdd604 is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }
}
