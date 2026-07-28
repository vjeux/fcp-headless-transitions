// OZStyleFactory.ts — FCP Ozone framework's OZStyleFactory class.
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (see raw-port/re/disasm/OZStyleFactory.~OZStyleFactory.s).
//
// Symbols (nm | c++filt):
//   0x6dadb0 t OZStyleFactory::~OZStyleFactory()   (D1)
//   0x6dadc0 t OZStyleFactory::~OZStyleFactory()   (D0)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/OZStyleFactory.~OZStyleFactory.s   (D0 body)
//   /tmp/Ozone_tV.txt inspected for D1 body @0x6dadb0.
//
// Both destructor entries are the compact `pushq %rbp; movq %rsp,%rbp; ud2`
// unreachable-trap sequence — the class is never destroyed through
// either of its C++-ABI dtor entry points.  There is no C2/D2 base
// dtor emitted (no ~OZStyleFactory ever runs); the class either
// never leaves scope (singleton) or is torn down via an unrelated
// path (e.g. explicit teardown callback) not visible from its
// destructor slot.
//
// nm shows no ctor and no other member functions for OZStyleFactory
// in this build — only the two dtor traps.  This class ports as a
// pair of throwing dtor entries and nothing else; if a caller later
// needs OZStyleFactory member methods they will show up as new
// ledger entries.

/**
 * OZStyleFactory — Ozone class whose C++ destructor entries are both
 * emitted as `ud2` (compiler-inserted unreachable traps).
 *
 * @class Ozone OZStyleFactory
 * @provenance Ozone @0x6dadb0 (D1), @0x6dadc0 (D0)
 */
export class OZStyleFactory {
  /**
   * OZStyleFactory::~OZStyleFactory() — D1 complete-object destructor.
   *
   * Ozone @0x6dadb0..0x6dadb6:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     ud2                             ; unreachable
   *
   * The compiler emits `ud2` when it can prove control never reaches this
   * destructor — for OZStyleFactory this means every constructed instance
   * has an eternal lifetime (singleton) or is torn down through a
   * different entry point.
   *
   * @provenance Ozone @0x6dadb0
   */
  destroy(): void {
    throw new Error(
      "OZStyleFactory::~OZStyleFactory() D1 @Ozone 0x6dadb0 is a `ud2` " +
      "unreachable trap — the class is never destroyed through its " +
      "complete-object destructor."
    );
  }

  /**
   * OZStyleFactory::~OZStyleFactory() — D0 deleting destructor.
   *
   * Ozone @0x6dadc0..0x6dadc6: same `pushq %rbp; movq %rsp,%rbp; ud2`
   * unreachable-trap body as D1.
   *
   * @provenance Ozone @0x6dadc0
   */
  destroyAndFree(): void {
    throw new Error(
      "OZStyleFactory::~OZStyleFactory() D0 @Ozone 0x6dadc0 is a `ud2` " +
      "unreachable trap — the class is never destroyed through its " +
      "deleting destructor."
    );
  }
}
