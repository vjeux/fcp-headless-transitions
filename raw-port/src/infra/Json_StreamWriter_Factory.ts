// Json_StreamWriter_Factory.ts — Json::StreamWriter::Factory (ProCore.framework).
//
// `Factory` is a nested class inside `Json::StreamWriter` — the JsonCpp
// abstract factory that produces concrete StreamWriter implementations for
// Json::writeString(Json::StreamWriter::Factory const&, Json::Value const&)
// (@ProCore __ZN4Json11writeStringERKNS_12StreamWriter7FactoryERKNS_5ValueE).
// Only the destructor trio (D0/D1/D2) is exported at this scope — from the
// ELF layer this is a pure interface with no data members.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice).
// Disasm: otool -tV of the ProCore binary; see gate provenance rules.
//
// The compiled destructors are all `ud2` traps — clang's canonical output
// when the compiler proves the base-class dtor entry can never be reached
// (all live instances are concrete subclasses whose own dtor handles
// teardown). Same pattern as PCSerializer._dtorD1 @Ozone 0x6DAF30 and
// PCSerializerWriteStream [D0] @ProCore 0xDD604.

/**
 * Json::StreamWriter::Factory — abstract factory that constructs concrete
 * StreamWriter implementations. Empty at this layer; concrete derived
 * factories (undecoded here) hold the config that shapes the produced
 * writer.
 */
export class Json_StreamWriter_Factory {
  /**
   * Json::StreamWriter::Factory::~Factory() [D0 deleting-dtor] @ProCore 0x000DDEC2.
   *
   * Disassembly (3 lines — from otool -tV of ProCore.framework x86_64):
   *   ddec2  pushq  %rbp
   *   ddec3  movq   %rsp, %rbp
   *   ddec6  ud2                          ; deliberate CPU trap.
   *
   * Body: `ud2` @ProCore 0xDDEC2 — abstract-class trap. Byte-identical shape
   * to PCSerializer._dtorD1 @Ozone 0x6DAF30 and to PCSerializerWriteStream
   * [D0] @ProCore 0xDD604: clang emits `ud2` for the base-class deleting-
   * dtor entry when the compiler proves it can never be reached (all live
   * instances are concrete subclasses whose own D0 handles teardown). The
   * sibling D1 and D2 at nearby addresses are byte-identical (also `ud2`) —
   * not the leaf here.
   *
   * Ported as a raising stub that cites the address, per the
   * PCSerializerWriteStream (ProChannel D0) and PCSerializer._dtorD1
   * precedents. The decode IS `ud2`; this throw is the faithful port, not a
   * deferral of an undecoded body.
   */
  protected _dtorD0(): never {
    throw new Error(
      "Json::StreamWriter::Factory::~Factory() [D0] @ProCore 0xddec2 is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }

  /**
   * Json::StreamWriter::Factory::~Factory() [D1 complete-object dtor] @ProCore 0x000DDEBC.
   *
   * Disassembly (3 lines — from otool -tV of ProCore.framework x86_64):
   *   ddebc  pushq  %rbp
   *   ddebd  movq   %rsp, %rbp
   *   ddec0  ud2                          ; deliberate CPU trap.
   *
   * Byte-identical shape to the sibling D0 above at @ProCore 0xDDEC2, and to
   * PCSerializer._dtorD1 @Ozone 0x6DAF30 and PCStreamElement._dtorD1
   * @ProCore 0xDD63A: clang emits `ud2` for the abstract base-class dtor
   * entry when the compiler proves it can never be reached (all live
   * instances are concrete subclasses whose own dtor handles teardown).
   *
   * Ported as a raising stub that cites the address, matching the D0 method
   * above. The decode IS `ud2`; this throw is the faithful port, not a
   * deferral of an undecoded body.
   */
  protected _dtorD1(): never {
    throw new Error(
      "Json::StreamWriter::Factory::~Factory() [D1] @ProCore 0xddebc is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }
}
