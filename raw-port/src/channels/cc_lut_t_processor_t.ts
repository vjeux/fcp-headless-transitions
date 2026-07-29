// cc_lut_t_processor_t.ts — cc::lut_t::processor_t (ProCore.framework).
//
// `processor_t` is a NESTED class inside cc::lut_t (see cc::lut_t::process
// which takes `cc::lut_t::processor_t const&`). It is an abstract callback
// interface used by cc::lut_t::process(): the LUT walks its samples and
// hands each one to processor_t's virtual method(s). Only the destructor
// trio is exported at this class scope — D0/D1/D2 — so from the ELF layer
// this class is pure interface.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice).
// Disasm saved: raw-port/re/disasm/ProCore.cc_lut_t_processor_t.~processor_t.s
//
// The compiled destructors are all `ud2` traps — clang's canonical output
// when the compiler proves the base-class dtor entry can never be reached
// (all live instances are concrete subclasses whose own dtor handles
// teardown). Same pattern as PCSerializer._dtorD1 @Ozone 0x6DAF30 and
// PCStreamElement._dtorD1 @ProCore 0xDD63A.

/**
 * cc::lut_t::processor_t — abstract per-sample callback interface for the
 * cc::lut_t LUT walker. Empty at this layer; concrete derived processors
 * (undecoded here) hold the actual sample-transform state.
 */
export class cc_lut_t_processor_t {
  /**
   * cc::lut_t::processor_t::~processor_t() [D0 deleting-dtor] @ProCore 0x000DDC6C.
   *
   * Disassembly (3 lines — from otool -tV of ProCore.framework x86_64):
   *   ddc6c  pushq  %rbp
   *   ddc6d  movq   %rsp, %rbp
   *   ddc70  ud2                          ; deliberate CPU trap.
   *
   * Body: `ud2` @ProCore 0xDDC6C — abstract-class trap. Byte-identical shape
   * to PCSerializer._dtorD1 @Ozone 0x6DAF30 and to PCSerializerWriteStream
   * [D0] @ProCore 0xDD604: clang emits `ud2` for the base-class deleting-
   * dtor entry when the compiler proves it can never be reached (all live
   * instances are concrete subclasses whose own D0 handles teardown). The
   * sibling D1 at @ProCore 0x000DDC66 and D2 at @ProCore 0x000DDC66 are
   * byte-identical (also `ud2`) — not the leaf here.
   *
   * Ported as a raising stub that cites the address, per the destroyAndDelete
   * (ProChannel PCSerializerWriteStream D0) and PCSerializer._dtorD1
   * precedents. The decode IS `ud2`; this throw is the faithful port, not a
   * deferral of an undecoded body.
   */
  protected _dtorD0(): never {
    throw new Error(
      "cc::lut_t::processor_t::~processor_t() [D0] @ProCore 0xddc6c is a `ud2` trap — must not be invoked on an abstract base instance",
    );
  }
}
