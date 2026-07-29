// Json_StreamWriter.ts — Json::StreamWriter (ProCore.framework).
//
// `Json::StreamWriter` is the JsonCpp abstract base class for serializers that
// stream a Json::Value to an output — the pure-virtual whose concrete
// subclass (`Json::BuiltStyledStreamWriter`, dtors @ProCore 0xC848C/0xC8520)
// is produced by Json::StreamWriter::Factory (see Json_StreamWriter_Factory.ts)
// and driven by Json::writeString(Json::StreamWriter::Factory const&,
// Json::Value const&) (@ProCore __ZN4Json11writeStringERKNS_12StreamWriter7FactoryERKNS_5ValueE).
// From the ELF layer this base scope exports only its destructor pair
// (D1 complete-object / D0 deleting) and carries no live data members.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice).
// Disasm: otool -tV -arch x86_64 of the ProCore binary; see gate provenance
// rules. Source .s: raw-port/re/disasm/ProCore.__ZN4Json12StreamWriterD1Ev.s
//
// The compiled destructors are all `ud2` traps — clang's canonical output
// when the compiler proves the base-class dtor entry can never be reached
// (all live instances are concrete subclasses whose own dtor handles
// teardown). Same pattern as the nested Json::StreamWriter::Factory dtors
// (Json_StreamWriter_Factory.ts, @ProCore 0xDDEBC/0xDDEC2), PCSerializer.
// _dtorD1 @Ozone 0x6DAF30, and PCSerializerWriteStream [D0] @ProCore 0xDD604.

/**
 * Json::StreamWriter — abstract base serializer. Empty at this layer; the
 * concrete derived writer (undecoded here) holds the formatting state that
 * shapes the emitted JSON text.
 */
export class Json_StreamWriter {
  /**
   * Json::StreamWriter::~StreamWriter() [D1 complete-object dtor] @ProCore 0x000DDEAE.
   *
   * Disassembly (3 lines — from otool -tV -arch x86_64 of ProCore.framework):
   *   ddeae  pushq  %rbp
   *   ddeaf  movq   %rsp, %rbp
   *   ddeb2  ud2                          ; deliberate CPU trap.
   *
   * Body: `ud2` @ProCore 0xDDEAE — abstract-class trap. Byte-identical to the
   * immediately following sibling D0 @ProCore 0xDDEB4 (pushq %rbp; movq
   * %rsp,%rbp; ud2), and to the nested Factory dtors @ProCore 0xDDEBC/0xDDEC2,
   * PCSerializer._dtorD1 @Ozone 0x6DAF30, and PCSerializerWriteStream [D0]
   * @ProCore 0xDD604: clang emits `ud2` for the base-class dtor entry when
   * the compiler proves it can never be reached (every live instance is a
   * concrete subclass whose own dtor performs teardown).
   *
   * Ported as a raising stub that cites the address, per the
   * Json_StreamWriter_Factory and PCSerializerWriteStream precedents. The
   * decode IS `ud2`; this throw is the faithful port, not a deferral of an
   * undecoded body.
   */
  _dtorD1(): never {
    throw new Error(
      "Json::StreamWriter::~StreamWriter() [D1] @ProCore 0xddeae is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }

  /**
   * Json::StreamWriter::~StreamWriter() [D0 deleting-dtor] @ProCore 0x000DDEB4.
   *
   * Disassembly (3 lines — from otool -tV -arch x86_64 of ProCore.framework):
   *   ddeb4  pushq  %rbp
   *   ddeb5  movq   %rsp, %rbp
   *   ddeb8  ud2                          ; deliberate CPU trap.
   *   (ddeba nop  — inter-function alignment padding, not part of the body.)
   *
   * Byte-identical shape to the D1 above at @ProCore 0xDDEAE and to the
   * Factory dtors: an unreachable abstract base-class deleting-dtor entry
   * that clang lowered to `ud2`.
   *
   * Ported as a raising stub that cites the address, matching the D1 method
   * above. The decode IS `ud2`; this throw is the faithful port.
   */
  _dtorD0(): never {
    throw new Error(
      "Json::StreamWriter::~StreamWriter() [D0] @ProCore 0xddeb4 is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }
}
