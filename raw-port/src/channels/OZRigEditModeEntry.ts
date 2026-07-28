// OZRigEditModeEntry.ts — Ozone rig-edit-mode entry value type (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// This is a small value class — 32 bytes of storage, two members:
//   0x00  OZChannelRef  channelRef  — 24 bytes (OZChannelRef embeds the
//                                     OZChannelBase-target pointer pair and
//                                     one extra slot; see ctor bodies).
//   0x18  u64           someField   — an additional 8-byte payload; zeroed
//                                     by the C1-from-OZChannelBase ctor and
//                                     copied verbatim by op= / copy-ctor.
//
// Six symbols ported (C1/C2 pairs for two ctor overloads, plus operator=
// and operator==):
//
//   * __ZN18OZRigEditModeEntryC2EPK13OZChannelBase
//       OZRigEditModeEntry::OZRigEditModeEntry(OZChannelBase const*)
//         [C2 base ctor]                                             @0x56d270
//   * __ZN18OZRigEditModeEntryC1EPK13OZChannelBase
//       OZRigEditModeEntry::OZRigEditModeEntry(OZChannelBase const*)
//         [C1 complete ctor]                                         @0x56d290
//   * __ZN18OZRigEditModeEntryC2ERKS_
//       OZRigEditModeEntry::OZRigEditModeEntry(OZRigEditModeEntry const&)
//         [C2 copy-ctor base]                                        @0x56d2b0
//   * __ZN18OZRigEditModeEntryC1ERKS_
//       OZRigEditModeEntry::OZRigEditModeEntry(OZRigEditModeEntry const&)
//         [C1 copy-ctor complete]                                    @0x56d2f0
//   * __ZN18OZRigEditModeEntryaSERKS_
//       OZRigEditModeEntry::operator=(OZRigEditModeEntry const&)     @0x56d330
//   * __ZNK18OZRigEditModeEntryeqERKS_
//       OZRigEditModeEntry::operator==(OZRigEditModeEntry const&) const
//                                                                    @0x56d360
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all unported)
// -----------------------------------------------------------------------------
//   * OZChannelRef::OZChannelRef(OZChannelBase const*, OZChannelBase const*)
//       @stub Ozone 0x6dd704
//   * OZChannelRef::OZChannelRef()  [default]
//       @stub Ozone 0x6dd716
//   * OZChannelRef::operator=(OZChannelRef const&)
//       @stub Ozone 0x6dd722
//   * OZChannelRef::~OZChannelRef()
//       @stub Ozone 0x6dd71c
//   * OZChannelRef::operator==(OZChannelRef const&) const
//       @stub Ozone 0x6df50a
//   * __Unwind_Resume
//       @stub Ozone 0x6dd07a

/** Opaque OZChannelBase handle — not yet transcribed. */
export type OZChannelBase = object;

/** Opaque OZChannelRef handle — the 24-byte value type stored at
 *  OZRigEditModeEntry+0x00.  Not yet transcribed. */
export type OZChannelRef = object;

export class OZRigEditModeEntry {
  /** @+0x00 (24 bytes) — the OZChannelRef, constructed by every ctor here
   *  via one of the OZChannelRef ctor stubs (see per-method notes). */
  channelRef: OZChannelRef | null = null;

  /** @+0x18 — u64 payload; the OZChannelBase-taking C1/C2 zero this @0x56d2a0
   *  (and its C2 twin @0x56d280).  The copy-ctors and operator= copy it
   *  verbatim from the source (@0x56d2d1 / @0x56d311 / @0x56d346).  Modeled
   *  as an opaque `unknown` slot since its meaning isn't yet decoded. */
  extraField: unknown = null;

  /**
   * OZRigEditModeEntry::OZRigEditModeEntry(OZChannelBase const*)
   *   [C1 complete-object ctor]                                   — @0x56d290
   *
   * Body verbatim:
   *   @0x56d296  rbx = this=rdi
   *   @0x56d299  rdx = 0                            (2nd arg to OZChannelRef ctor)
   *   @0x56d29b  OZChannelRef::OZChannelRef(&this[+0x00], baseArg, nullptr)
   *                                                    — stub Ozone 0x6dd704
   *   @0x56d2a0  this[+0x18] = 0                    (u64 zero)
   *   ret.
   *
   * The C2 twin @0x56d270 is byte-identical (14 asm insns) — the labeled
   * disasm only shows C1, but the body at 0x56d270 is the same three
   * pushes/mov, `OZChannelRef ctor with (this, base, null)`, and zeroing
   * of `this[+0x18]`, then return.
   *
   * OZChannelRef ctor is unported — raise.
   */
  constructor(_base: OZChannelBase | null) {
    // @0x56d29b OZChannelRef::OZChannelRef(&this, base, nullptr) — unported
    // @0x56d2a0 this[+0x18] = 0
    // Frontier unresolved — raise. @0x56d290
    throw new Error(
      "OZRigEditModeEntry::OZRigEditModeEntry(OZChannelBase*): requires " +
        "OZChannelRef::OZChannelRef(OZChannelBase const*, OZChannelBase const*) — " +
        "not ported. @0x56d290",
    );
  }

  /**
   * OZRigEditModeEntry::OZRigEditModeEntry(OZChannelBase const*)
   *   [C2 base-object ctor]                                       — @0x56d270
   *
   * Body is byte-identical to the C1 twin above (same three insns before the
   * OZChannelRef ctor call, same @0x56d27b callq to stub 0x6dd704, same
   * @0x56d280 zero-store to this[+0x18], same return).
   */
  static OZRigEditModeEntryC2FromBase(
    _self: OZRigEditModeEntry,
    _base: OZChannelBase | null,
  ): void {
    // Same body as C1 @0x56d290 — frontier unresolved — raise. @0x56d270
    throw new Error(
      "OZRigEditModeEntry::OZRigEditModeEntry(OZChannelBase*) [C2]: requires " +
        "OZChannelRef::OZChannelRef(OZChannelBase const*, OZChannelBase const*) — " +
        "not ported. @0x56d270",
    );
  }

  /**
   * OZRigEditModeEntry::OZRigEditModeEntry(OZRigEditModeEntry const&)
   *   [C2 base copy-ctor]                                         — @0x56d2b0
   *
   * Body verbatim:
   *   @0x56d2b7  r14 = other=rsi
   *   @0x56d2ba  rbx = this=rdi
   *   @0x56d2bd  OZChannelRef::OZChannelRef(&this[+0x00])   — default ctor
   *                                                    — stub Ozone 0x6dd716
   *   @0x56d2c8  OZChannelRef::operator=(&this[+0x00], &other[+0x00])
   *                                                    — stub Ozone 0x6dd722
   *   @0x56d2d1  this[+0x18] = other[+0x18]
   *   ret.
   *
   * Exception path @0x56d2da→@0x56d2e8 runs OZChannelRef::~OZChannelRef()
   * (stub 0x6dd71c) then __Unwind_Resume (stub 0x6dd07a).
   *
   * i.e. default-construct then assign — the compiler didn't emit a real
   * copy-ctor for OZChannelRef and instead splits into ctor+op=.  Both
   * OZChannelRef entries are frontier stubs — raise.
   */
  static OZRigEditModeEntryC2Copy(
    _self: OZRigEditModeEntry,
    _other: OZRigEditModeEntry,
  ): void {
    // @0x56d2bd OZChannelRef::OZChannelRef() — unported
    // @0x56d2c8 OZChannelRef::operator=  — unported
    // @0x56d2d1 this[+0x18] = other[+0x18]
    // Frontier unresolved — raise. @0x56d2b0
    throw new Error(
      "OZRigEditModeEntry::OZRigEditModeEntry(const&) [C2]: requires " +
        "OZChannelRef default ctor + OZChannelRef::operator= — not ported. " +
        "@0x56d2b0",
    );
  }

  /**
   * OZRigEditModeEntry::OZRigEditModeEntry(OZRigEditModeEntry const&)
   *   [C1 complete copy-ctor]                                     — @0x56d2f0
   *
   * Body byte-identical to the C2 copy-ctor @0x56d2b0 (same push sequence,
   * same OZChannelRef default ctor @0x56d2fd, same OZChannelRef::operator=
   * @0x56d308, same `this[+0x18] = other[+0x18]` @0x56d311, same
   * exception unwind @0x56d31a onward).
   */
  static OZRigEditModeEntryC1Copy(
    _self: OZRigEditModeEntry,
    _other: OZRigEditModeEntry,
  ): void {
    // Same body as C2 @0x56d2b0 — frontier unresolved — raise. @0x56d2f0
    throw new Error(
      "OZRigEditModeEntry::OZRigEditModeEntry(const&) [C1]: requires " +
        "OZChannelRef default ctor + OZChannelRef::operator= — not ported. " +
        "@0x56d2f0",
    );
  }

  /**
   * OZRigEditModeEntry::operator=(OZRigEditModeEntry const&)      — @0x56d330
   *
   * Body verbatim:
   *   @0x56d337  rbx = other=rsi
   *   @0x56d33a  r14 = this=rdi
   *   @0x56d33d  OZChannelRef::operator=(&this[+0x00], &other[+0x00])
   *                                                    — stub Ozone 0x6dd722
   *   @0x56d346  this[+0x18] = other[+0x18]
   *   @0x56d34a  rax = this=r14   (return *this reference)
   *   ret.
   *
   * OZChannelRef::operator= is unported — raise.
   */
  assign(_other: OZRigEditModeEntry): OZRigEditModeEntry {
    // @0x56d33d OZChannelRef::operator= — unported
    // @0x56d346 this[+0x18] = other[+0x18]
    // @0x56d34a return this
    // Frontier unresolved — raise. @0x56d330
    throw new Error(
      "OZRigEditModeEntry::operator=: requires OZChannelRef::operator= — " +
        "not ported. @0x56d330",
    );
  }

  /**
   * OZRigEditModeEntry::operator==(OZRigEditModeEntry const&) const
   *                                                              — @0x56d360
   *
   * Body verbatim (5 insns — pushq/movq/popq/jmp):
   *   @0x56d360  pushq %rbp
   *   @0x56d361  movq  %rsp, %rbp
   *   @0x56d364  popq  %rbp
   *   @0x56d365  jmp   OZChannelRef::operator==(&this[+0x00], &other[+0x00])
   *                                                    — stub Ozone 0x6df50a
   *
   * Pure tail-call to `OZChannelRef::operator==`.  This deliberately IGNORES
   * `this[+0x18]` (the extraField) in the equality check — a real, decoded
   * observation of the ABI (not an approximation).
   *
   * OZChannelRef::operator== is unported — raise.
   */
  equals(_other: OZRigEditModeEntry): boolean {
    // @0x56d365 tail-jmp OZChannelRef::operator== — unported
    // NOTE: this[+0x18] is intentionally NOT compared (per the asm).
    // @0x56d360
    throw new Error(
      "OZRigEditModeEntry::operator==: requires OZChannelRef::operator== — " +
        "not ported. @0x56d360",
    );
  }
}
