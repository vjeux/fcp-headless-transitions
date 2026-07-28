// OZTextStyle.ts — Ozone text-style value class (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// A thin subclass of OZStyle that installs 3 vtables (primary @+0x00, and
// two secondary MI subobject vptrs @+0x10 and @+0x28), then otherwise
// delegates all state and behaviour to the OZStyle base.  Each of the three
// public ctors here just:
//
//   1. Delegate-calls the matching OZStyle base ctor (which builds the
//      full 0x60-byte state — see OZStyle-family bodies in the .text).
//   2. Overwrites the three vptr slots with OZTextStyle's own vtables.
//
// -----------------------------------------------------------------------------
// SHAPE (as observed from the vptr installs)
// -----------------------------------------------------------------------------
//   0x00  vptr_primary        — OZTextStyle's own primary vtable, installed
//                                @0x14a5d5 (C2 factory ctor), @0x14a615
//                                (C2 copy), and @0x14a655 (C2 copy-with-scene).
//   0x10  vptr_secondary_1    — installed @0x14a5df / @0x14a61f / @0x14a65f.
//   0x28  vptr_secondary_2    — installed @0x14a5ea / @0x14a62a / @0x14a66a.
//   [rest = OZStyle base state — 0x60 bytes total for OZStyle; not decoded
//   here since we don't own it.]
//
// The class is 3-way-MI (primary + two secondaries at +0x10 and +0x28),
// matching the OZStyle inheritance layout — that's why the compiler emits
// `__ZThn16_...` and `__ZThn40_...` non-virtual thunks for D1/D0.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all unported)
// -----------------------------------------------------------------------------
//   * OZStyle::OZStyle(OZFactory*, PCString const&, unsigned int)
//                                            @0x14a5c9 (in-binary, unported)
//   * OZStyle::OZStyle(OZStyle const&, unsigned int)
//                                            @0x14a609 (in-binary, unported)
//   * OZStyle::OZStyle(OZStyle const&, OZSceneNode*, unsigned int)
//                                            @0x14a649 (in-binary, unported)
//   * OZStyle::~OZStyle()
//                                            @0x14a685 (in-binary, unported;
//                                                        tail-jmp from D2)
//
// -----------------------------------------------------------------------------
// Symbols ported (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11OZTextStyleC2EP9OZFactoryRK8PCStringj                  @0x14a5c0
//       OZTextStyle::OZTextStyle(OZFactory*, PCString const&, unsigned int)
//       [C2 = C1 in this compilation — the C1 mangled name @0x14a5c0 that
//       brief.py listed and the C2 mangled name in /tmp/Ozone_tV.txt at
//       0x14a5c0 both point at the same body.]
//   * __ZN11OZTextStyleC2ERKS_j                                     @0x14a600
//       OZTextStyle::OZTextStyle(OZTextStyle const&, unsigned int)
//   * __ZN11OZTextStyleC2ERKS_P11OZSceneNodej                       @0x14a640
//       OZTextStyle::OZTextStyle(OZTextStyle const&, OZSceneNode*, unsigned int)
//   * __ZN11OZTextStyleD2Ev                                         @0x14a680
//       OZTextStyle::~OZTextStyle()  [D2 base dtor]
//   * __ZN11OZTextStyleD1Ev                                         @0x6db140
//       OZTextStyle::~OZTextStyle()  [D1 complete dtor]
//   * __ZN11OZTextStyleD0Ev                                         @0x6db170
//       OZTextStyle::~OZTextStyle()  [D0 deleting dtor]

/** Opaque OZFactory handle — not yet transcribed. */
export type OZFactory = object;

/** Opaque PCString handle — see the PCString port for the real 8-byte
 *  shared-cow-string ABI. */
export type PCString = object;

/** Opaque OZSceneNode handle — not yet transcribed. */
export type OZSceneNode = object;

export class OZTextStyle {
  /** Primary vptr @+0x00 — installed by every ctor via a fresh RIP-relative
   *  lea, cited per method.  Modeled as opaque. */
  vptrPrimary: unknown = null;

  /** Secondary vptr @+0x10 — the first MI secondary. */
  vptrSecondary1: unknown = null;

  /** Secondary vptr @+0x28 — the second MI secondary. */
  vptrSecondary2: unknown = null;

  /**
   * OZTextStyle::OZTextStyle(OZFactory*, PCString const&, unsigned int)
   *                                                              — @0x14a5c0
   *
   * Body verbatim (per /tmp/Ozone_tV.txt @ __ZN11OZTextStyleC2EP9OZFactoryRK8PCStringj):
   *   @0x14a5c6  rbx = this=rdi
   *   @0x14a5c9  OZStyle::OZStyle(this, factory=rsi, name=rdx, mode=rcx)
   *                                                    — in-binary, unported
   *   @0x14a5d5  this[+0x00] = <textStyle_vptr_primary @ RIP+0x6f459b = 0x83eb70>
   *   @0x14a5df  this[+0x10] = <textStyle_vptr_secondary1 @ RIP+0x6f46c1 = 0x83eca0>
   *   @0x14a5ea  this[+0x28] = <textStyle_vptr_secondary2 @ RIP+0x6f490e = 0x83eef8>
   *   ret.
   *
   * OZStyle base ctor is unported — raise.
   */
  constructor(_factory: OZFactory | null, _name: PCString, _mode: number) {
    // @0x14a5c9 OZStyle::OZStyle(factory, name, mode) — unported base ctor.
    // @0x14a5d5/@0x14a5df/@0x14a5ea vptr installs (all 3 vtables are
    // OZTextStyle-owned but unmodeled here — opaque).
    // Base ctor unresolved — raise. @0x14a5c0
    throw new Error(
      "OZTextStyle::OZTextStyle(OZFactory*, PCString const&, unsigned int): " +
        "requires OZStyle::OZStyle(OZFactory*, PCString const&, unsigned int) — " +
        "not ported. @0x14a5c0",
    );
  }

  /**
   * OZTextStyle::OZTextStyle(OZTextStyle const&, unsigned int)   — @0x14a600
   *
   * Body verbatim:
   *   @0x14a606  rbx = this=rdi
   *   @0x14a609  OZStyle::OZStyle(this, &other, mode=rdx)  — unported
   *   @0x14a615  this[+0x00] = <textStyle_vptr_primary   @ RIP+0x6f455b = 0x83eb70>
   *   @0x14a61f  this[+0x10] = <textStyle_vptr_secondary1 @ RIP+0x6f4681 = 0x83eca0>
   *   @0x14a62a  this[+0x28] = <textStyle_vptr_secondary2 @ RIP+0x6f48ce = 0x83eef8>
   *   ret.
   *
   * (RIP-relative deltas differ from the factory-ctor by ~0x40 each; the
   *  absolute targets are IDENTICAL — 0x83eb70/0x83eca0/0x83eef8 — because
   *  the vtables are class-wide, not per-ctor.)
   *
   * OZStyle copy-ctor is unported — raise.
   */
  static OZTextStyleC2Copy(
    _self: OZTextStyle,
    _other: OZTextStyle,
    _mode: number,
  ): void {
    // @0x14a609 OZStyle::OZStyle(const&, unsigned int) — unported.
    // @0x14a615/@0x14a61f/@0x14a62a same 3 vptr installs as C2 factory ctor.
    // Base ctor unresolved — raise. @0x14a600
    throw new Error(
      "OZTextStyle::OZTextStyle(OZTextStyle const&, unsigned int): " +
        "requires OZStyle::OZStyle(OZStyle const&, unsigned int) — " +
        "not ported. @0x14a600",
    );
  }

  /**
   * OZTextStyle::OZTextStyle(OZTextStyle const&, OZSceneNode*, unsigned int)
   *                                                              — @0x14a640
   *
   * Body verbatim:
   *   @0x14a646  rbx = this=rdi
   *   @0x14a649  OZStyle::OZStyle(this, &other, sceneNode=rdx, mode=rcx)
   *                                                    — unported
   *   @0x14a655  this[+0x00] = <textStyle_vptr_primary   @ RIP+0x6f451b = 0x83eb70>
   *   @0x14a65f  this[+0x10] = <textStyle_vptr_secondary1 @ RIP+0x6f4641 = 0x83eca0>
   *   @0x14a66a  this[+0x28] = <textStyle_vptr_secondary2 @ RIP+0x6f488e = 0x83eef8>
   *   ret.
   *
   * OZStyle copy-with-scene ctor is unported — raise.
   */
  static OZTextStyleC2CopyWithScene(
    _self: OZTextStyle,
    _other: OZTextStyle,
    _sceneNode: OZSceneNode | null,
    _mode: number,
  ): void {
    // @0x14a649 OZStyle::OZStyle(OZStyle const&, OZSceneNode*, unsigned int) — unported.
    // Base ctor unresolved — raise. @0x14a640
    throw new Error(
      "OZTextStyle::OZTextStyle(OZTextStyle const&, OZSceneNode*, unsigned int): " +
        "requires OZStyle::OZStyle(OZStyle const&, OZSceneNode*, unsigned int) — " +
        "not ported. @0x14a640",
    );
  }

  /**
   * OZTextStyle::~OZTextStyle()  [D2 base dtor]                  — @0x14a680
   *
   * Body verbatim (5 insns — pushq/movq/popq/jmp):
   *   @0x14a680  pushq %rbp
   *   @0x14a681  movq  %rsp, %rbp
   *   @0x14a684  popq  %rbp
   *   @0x14a685  jmp   OZStyle::~OZStyle(this)   — in-binary, unported
   *
   * Pure tail-call to OZStyle's D2.  This class ADDS NO STATE beyond the
   * OZStyle base, so the dtor has nothing of its own to tear down — it just
   * delegates.  OZStyle::~OZStyle is unported — raise.
   */
  static destroy_D2(_self: OZTextStyle): void {
    // @0x14a685 tail-jmp OZStyle::~OZStyle — unported.
    // @0x14a680
    throw new Error(
      "OZTextStyle::~OZTextStyle [D2]: requires OZStyle::~OZStyle() — " +
        "not ported. @0x14a680",
    );
  }

  /**
   * OZTextStyle::~OZTextStyle()  [D1 complete dtor]              — @0x6db140
   *
   * Body verbatim (3 insns):
   *   @0x6db140  pushq %rbp
   *   @0x6db141  movq  %rsp, %rbp
   *   @0x6db144  ud2                                             — SIGILL trap
   *
   * The compiler emitted an UNREACHABLE trap — the D1 complete-dtor path is
   * never taken in shipping FCP (this class always lives inside a smart-
   * pointer whose deleter LTO'd out to the trap variant).  The D0 twin
   * @0x6db170 is identical, as are the MI-thunk variants
   * `__ZThn16_...D1Ev` @0x6db150 / `__ZThn40_...D1Ev` @0x6db160 /
   * `__ZThn16_...D0Ev` @0x6db180 / `__ZThn40_...D0Ev` @0x6db190.
   *
   * Any actual call SIGILLs in the original binary; we surface the same as
   * a raise.
   */
  static destroy_D1(_self: OZTextStyle): void {
    // @0x6db144: ud2 — hardware SIGILL in the original binary. @0x6db140
    throw new Error(
      "OZTextStyle::~OZTextStyle [D1]: ud2 trap in the original binary — " +
        "this dtor is compiled unreachable. @0x6db140",
    );
  }

  /**
   * OZTextStyle::~OZTextStyle()  [D0 deleting dtor]              — @0x6db170
   *
   * Same body as D1 @0x6db140 — an unconditional `ud2` trap @0x6db174.
   */
  static destroy_D0(_self: OZTextStyle): void {
    // @0x6db174: ud2 — hardware SIGILL in the original binary. @0x6db170
    throw new Error(
      "OZTextStyle::~OZTextStyle [D0]: ud2 trap in the original binary — " +
        "this dtor is compiled unreachable. @0x6db170",
    );
  }
}
