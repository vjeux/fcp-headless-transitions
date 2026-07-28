// raw-port: PCSerializer — Ozone framework (originally from ProChannel.framework namespace)
//
// This is the abstract base for the "PC" (ProChannel) serialization stack:
// PCSerializerReadStream / PCSerializerWriteStream (both concrete streams show
// up as undefined references in Ozone.framework — see e.g.
//   U __ZN13OZChannelBase10parseBeginER22PCSerializerReadStream
//   U __ZN11OZFactories13saveFactoriesER23PCSerializerWriteStream
// which prove those subclasses live in ProChannel.framework and are only
// consumed here).
//
// Ozone.framework surfaces only three PCSerializer entry points (see brief.py
// output for `PCSerializer` — 3 methods, layer=infra):
//
//   0x0000000000001dab0  PCSerializer::readSignificantWhiteSpace()
//   0x00000000006daf30   PCSerializer::~PCSerializer()      (D1 — base dtor)
//   0x00000000006daf40   PCSerializer::~PCSerializer()      (D0 — deleting dtor)
//
// TYPEINFO / VTABLE (nm -n on Ozone, x86_64 slice):
//   __ZTS12PCSerializer  @0x7077A2  ->  "12PCSerializer"
//   __ZTI12PCSerializer  @0x8326F0  (typeinfo record)
//   __ZTV12PCSerializer  @0x832B70  (vtable — installed-ptr = TV+0x10 conventionally)
//
// The presence of a __ZTI12PCSerializer WITHOUT a __ZTS-only marker plus the
// fact that BOTH destructors are `ud2` traps is the canonical clang shape for
// "abstract class that is never directly instantiated" — the compiler emits
// dtor thunks so the vtable slots exist, but the bodies are unreachable
// because every derived class provides its own D1/D0. Same shape as
// OZEffectFactory (./OZEffectFactory.ts) and OZBehaviorFactory
// (../channels/OZBehaviorFactory.ts) elsewhere in this port.
//
// STRUCT LAYOUT:
//   PCSerializer introduces NO decoded fields. `readSignificantWhiteSpace()`
//   touches neither `rdi` (this) nor any argument — it is a pure `return 0`
//   that any subclass that cares (typically the text-mode
//   PCSerializerReadStream reader) will override.
//
// FRONTIER (undecoded — not stubbed here, only named for future workers):
//   - PCSerializerReadStream (external ref, ProChannel.framework — a raw-port
//     TS placeholder exists at ./PCSerializerReadStream.ts).
//   - PCSerializerWriteStream (external ref, ProChannel.framework).
//   - The full PCSerializer vtable (only slots for D1/D0 and this method
//     are decoded from Ozone; the rest of the slots come from
//     ProChannel.framework and are not accessible from Ozone's binary).

/**
 * PCSerializer — abstract base of the ProChannel serialization stack.
 *
 * Marked `abstract` because the C++ class is abstract: both its D1 (0x6DAF30)
 * and D0 (0x6DAF40) destructor entries are single `ud2` instructions (bytes
 * 0F 0B), the canonical Apple/clang shape for a compiler-emitted trap on an
 * unreachable dtor thunk. No PCSerializer constructor symbol is emitted in
 * Ozone either — only derived-class ctors are emitted.
 *
 * The single non-dtor method PCSerializer exposes in Ozone is the whitespace
 * probe below: subclasses override to return the actual count of significant
 * whitespace characters consumed at the current stream position; the base
 * returns 0 (nothing consumed).
 */
export abstract class PCSerializer {
  /**
   * PCSerializer::readSignificantWhiteSpace() — @Ozone 0x0001DAB0.
   *
   * Disassembly (7 lines total — see raw-port/re/disasm/PCSerializer.readSignificantWhiteSpace.s):
   *   1dab0  pushq  %rbp
   *   1dab1  movq   %rsp, %rbp
   *   1dab4  xorl   %eax, %eax     ; return value = 0
   *   1dab6  popq   %rbp
   *   1dab7  retq
   *   1dab8  nopl   (%rax,%rax)
   *
   * Body: `return 0;`. No reads of `this` or any argument. This is the base
   * "did we consume any significant whitespace?" probe — the default is
   * "no, zero characters consumed". Text-mode subclasses (typically the
   * PCSerializerReadStream family) override to actually scan and return
   * the number of whitespace characters skipped.
   *
   * The C++ return type is not directly encoded in the mangled name
   * (`__ZN12PCSerializer25readSignificantWhiteSpaceEv`), but the base
   * clears only the low 32 bits of `%rax` (`xorl %eax, %eax`) rather than
   * the full 64, which is consistent with an `int` / `size_t` (any 32-bit
   * or narrower integer) return convention. We type the port as `number`
   * to keep parity with JS's single numeric type; subclasses returning
   * a wider count still round-trip losslessly for realistic whitespace
   * lengths.
   */
  readSignificantWhiteSpace(): number {
    // @0x1dab4  xorl %eax, %eax  — return 0
    return 0;
  }

  /**
   * PCSerializer::~PCSerializer() — D1 (complete-object dtor) @Ozone 0x006DAF30.
   *
   * Disassembly (5 lines — see raw-port/re/disasm/PCSerializer.~PCSerializer.s
   * for the D0 form; D1 is byte-identical modulo address):
   *   6daf30  pushq  %rbp
   *   6daf31  movq   %rsp, %rbp
   *   6daf34  ud2
   *   6daf36  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` @Ozone 0x6DAF30 — abstract-class trap. Called only if the
   * runtime somehow reaches this base-class dtor entry directly (it
   * shouldn't; all live instances are of a concrete subclass whose own D1
   * handles teardown). Ported as a raising stub that cites the address, per
   * anti-shortcut rules (an unreachable trap must be a loud gap, not a
   * silent no-op).
   */
  protected _dtorD1(): never {
    throw new Error(
      "PCSerializer::~PCSerializer() D1 @Ozone 0x6daf30 is `ud2` — abstract-class trap, must never be reached",
    );
  }

  /**
   * PCSerializer::~PCSerializer() — D0 (deleting dtor) @Ozone 0x006DAF40.
   *
   * Disassembly (5 lines):
   *   6daf40  pushq  %rbp
   *   6daf41  movq   %rsp, %rbp
   *   6daf44  ud2
   *   6daf46  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` — abstract-class trap (mirror of D1). Same rationale as
   * _dtorD1.
   */
  protected _dtorD0(): never {
    throw new Error(
      "PCSerializer::~PCSerializer() D0 @Ozone 0x6daf40 is `ud2` — abstract-class trap, must never be reached",
    );
  }
}
