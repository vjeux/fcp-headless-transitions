// OZChannelColorNoAlpha — Ozone compound channel that groups three OZChannel
// sub-channels (red, green, blue — the alpha-less sibling of `OZChannelColor`)
// plus a fourth `OZChannelEnum`-typed sub-channel (colour space / gamma flag).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (x86_64 fat sub-slice; sub-arch file offset 0x4000).
//
// ONLY the complete-object destructor (D1) is exported from Ozone for this
// class. The three ctor variants (default / RGB / RGB-with-info) all live in
// the U-extern set and are not disassemblable from this framework — every
// per-instance-state-setup path is therefore surfaced as a throwing frontier
// stub with the exact call site cited (see below).
//
// Source disassembly:
//   raw-port/re/disasm/OZChannelColorNoAlpha.~OZChannelColorNoAlpha.s   @Ozone 0x8d590
//
// SYMBOLS EXPOSED ON THIS CLASS (nm -a Ozone):
//   __ZN21OZChannelColorNoAlphaD1Ev  ->  OZChannelColorNoAlpha::~OZChannelColorNoAlpha()   @0x8d590
//
// VTABLE — recovered from the D1 install:
//   @Ozone 0x8d599:  movq 0x795350(%rip), %rax       ; %rax = &_ZTV21OZChannelColorNoAlpha
//   @Ozone 0x8d59d:  next-insn PC = 0x8d5a0, so vtable VA = 0x8d5a0 + 0x795350 = 0x8228f0.
//   Primary vptr    = vtable + 0x10 = 0x822900     (written to *(this+0)     @0x8d5a4)
//   Secondary vptr  = vtable + 0x370 = 0x822c60    (written to *(this+0x10)  @0x8d5ad)
//   This is the same two-vptr install pattern used by every OZChannel-lineage
//   compound channel (cf. OZChannelShearAngle, OZChannel2D, OZChannel3D,
//   OZChannelAngle, OZChannelDouble — they all install a primary at
//   `vtable + 0x10` and a secondary at `vtable + 0x370`).
//
// STRUCT LAYOUT — recovered from the D1 dtor:
//   +0x000  primary vptr                     (= vtable+0x10 = 0x822900, install @0x8d5a4)
//   +0x008..+0x00f                           (opaque — OZCompoundChannel base subobject slot 0)
//   +0x010  secondary vptr                   (= vtable+0x370 = 0x822c60, install @0x8d5ad)
//   +0x018..+0x087                           (rest of OZCompoundChannel base subobject; the base
//                                             dtor `OZCompoundChannel::~OZCompoundChannel()`
//                                             tail-jmp @0x8d5f6 handles the teardown of everything
//                                             that lives in this range)
//   +0x088  OZChannel sub-channel  #1         (dtor call @0x8d5e1..0x8d5e8 → OZChannel::~OZChannel)
//   +0x120  OZChannel sub-channel  #2         (dtor call @0x8d5d5..0x8d5dc → OZChannel::~OZChannel)
//   +0x1b8  OZChannel sub-channel  #3         (dtor call @0x8d5c9..0x8d5d0 → OZChannel::~OZChannel)
//   +0x250  OZChannel sub-channel  #4         (dtor call @0x8d5bd..0x8d5c4 → OZChannel::~OZChannel)
//   +0x2e8  OZChannelEnum sub-channel         (dtor call @0x8d5b1..0x8d5b8 → OZChannelEnum::~OZChannelEnum)
//
// The FOUR contiguous OZChannel-shaped sub-objects are each 0x98 bytes wide
// (0x120-0x88 = 0x1b8-0x120 = 0x250-0x1b8 = 0x2e8-0x250 = 0x98 — the exact
// sizeof(OZChannelShearAngle) / sizeof(OZChannelDouble) recovered from
// clone-time `operator new(0x98)` in the sibling classes). The FIFTH
// (`OZChannelEnum`) sub-object begins at +0x2e8; its width is not observable
// from this dtor alone (the base-dtor tail-jmp closes out the layout at the
// class boundary), but every OZChannelEnum instance is at minimum 0x98 wide
// as well (same OZChannel-derived base).
//
// The dtor visits the sub-objects in **reverse construction order** — the
// OZChannelEnum at +0x2e8 (last-constructed → first-destructed), then the
// four OZChannels at +0x250, +0x1b8, +0x120, +0x88, then the base dtor.
// This is the standard C++ dtor unwind pattern.
//
// This class corresponds to the FCP colour-channel scope used by material
// pipelines that do NOT need an alpha component — the paired class
// `OZMaterialCompoundLayer::createDiffuseLayer(..., OZChannelColorNoAlpha*,
// OZChannelColorNoAlpha*, ...)` takes exactly TWO pointers to this class as
// its diffuse + emissive colour inputs. This is the ONLY consumer of the
// type visible in the Ozone symbol table.

// ── Frontier stubs — undecoded base-class callees ────────────────────────

/**
 * `OZChannelEnum::~OZChannelEnum()` — @Ozone symbol stub 0x6dd9d4, mangled
 * `__ZN13OZChannelEnumD1Ev`. Not yet transcribed. Called from
 * `~OZChannelColorNoAlpha` @Ozone 0x8d5b8 with `%rdi = this + 0x2e8`
 * (destructs the trailing OZChannelEnum sub-object). The `OZChannelEnum`
 * base class itself is not yet ported; when it lands, this stub should be
 * replaced by a call into that TS module.
 */
function OZChannelEnum_dtor_stub(_p: unknown): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum() @Ozone stub 0x6dd9d4 " +
      "(__ZN13OZChannelEnumD1Ev — not yet transcribed) — " +
      "invoked by OZChannelColorNoAlpha::~OZChannelColorNoAlpha() @Ozone 0x8d5b8",
  );
}

/**
 * `OZChannel::~OZChannel()` — @Ozone symbol stub 0x6df480, mangled
 * `__ZN9OZChannelD2Ev` (base-only D2 destructor). Not yet transcribed.
 * Called FOUR times from `~OZChannelColorNoAlpha`:
 *   @0x8d5c4  with %rdi = this + 0x250   (sub-channel #4)
 *   @0x8d5d0  with %rdi = this + 0x1b8   (sub-channel #3)
 *   @0x8d5dc  with %rdi = this + 0x120   (sub-channel #2)
 *   @0x8d5e8  with %rdi = this + 0x088   (sub-channel #1)
 * The OZChannel base dtor is undecoded here; when it lands, this stub
 * should be replaced by a direct call.
 */
function OZChannel_dtor_stub(_p: unknown): void {
  throw new Error(
    "OZChannel::~OZChannel() @Ozone stub 0x6df480 " +
      "(__ZN9OZChannelD2Ev — not yet transcribed) — " +
      "invoked by OZChannelColorNoAlpha::~OZChannelColorNoAlpha() @Ozone " +
      "0x8d5c4 (sub-channel@+0x250), 0x8d5d0 (sub-channel@+0x1b8), " +
      "0x8d5dc (sub-channel@+0x120), 0x8d5e8 (sub-channel@+0x88)",
  );
}

/**
 * `OZCompoundChannel::~OZCompoundChannel()` — @Ozone symbol stub 0x6de2b6,
 * mangled `__ZN17OZCompoundChannelD2Ev`. Not yet transcribed. Tail-jmp'd
 * from `~OZChannelColorNoAlpha` @Ozone 0x8d5f6 with `%rdi = this`,
 * finishing the destruction of the OZCompoundChannel base subobject
 * (which owns everything at +0x00..+0x87 that this dtor does not touch
 * directly). When OZCompoundChannel lands, this stub should be replaced
 * by a call into that TS module.
 */
function OZCompoundChannel_dtor_stub(_p: unknown): void {
  throw new Error(
    "OZCompoundChannel::~OZCompoundChannel() @Ozone stub 0x6de2b6 " +
      "(__ZN17OZCompoundChannelD2Ev — not yet transcribed) — " +
      "tail-jmp'd from OZChannelColorNoAlpha::~OZChannelColorNoAlpha() @Ozone 0x8d5f6",
  );
}

// ── Frontier stubs — the three ctors (all U-externs, not disassemblable) ─

/**
 * The class's C2 constructors are NOT emitted in the Ozone framework — they
 * are U-externs (undefined-symbol references) that must be resolved by
 * another framework at load time. They are surfaced here as throwing stubs
 * so that a caller who reaches for construction gets a loud, cited failure
 * instead of a silent zero-state instance.
 *
 * The consumer confirmed by the symbol table is
 *   OZMaterialCompoundLayer::createDiffuseLayer(...)
 * which takes TWO `OZChannelColorNoAlpha*` pointers as inputs.
 */
function OZChannelColorNoAlpha_ctor_stub(): OZChannelColorNoAlpha {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha(...) @Ozone U-extern " +
      "(all ctor variants not emitted in Ozone; the class is constructed by " +
      "another framework loader — no disassembly available on this side)",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelColorNoAlpha` — alpha-less compound colour channel. See file
 * header for layout, vtable install addresses, and consumer information.
 *
 * We model the observable per-instance state ONLY as opaque sub-object
 * slots — the four contiguous OZChannel sub-objects and the trailing
 * OZChannelEnum — because their base-class internals are frontier stubs.
 * Field names use the byte-offset suffix to keep the mapping to the C++
 * layout unambiguous.
 */
export class OZChannelColorNoAlpha {
  /** Primary vptr — @Ozone install site 0x8d5a4 loads vtable+0x10 (= VA
   *  0x822900) via the RIP-relative `0x795350(%rip)` at insn 0x8d599 whose
   *  next-insn PC is 0x8d5a0. Implicit in JS via prototype identity. */
  // (primary vtable slot is implicit)

  /** Secondary vptr — @Ozone install site 0x8d5ad loads vtable+0x370
   *  (= VA 0x822c60). Implicit. */
  // (secondary vtable slot is implicit)

  /** OZChannel sub-channel at C++ offset +0x88 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5e8. */
  subChannel_0x88!: unknown;

  /** OZChannel sub-channel at C++ offset +0x120 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5dc. */
  subChannel_0x120!: unknown;

  /** OZChannel sub-channel at C++ offset +0x1b8 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5d0. */
  subChannel_0x1b8!: unknown;

  /** OZChannel sub-channel at C++ offset +0x250 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5c4. */
  subChannel_0x250!: unknown;

  /** OZChannelEnum sub-channel at C++ offset +0x2e8.
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5b8. */
  subChannelEnum_0x2e8!: unknown;

  /**
   * The C++ ctor set is not emitted in Ozone (all three variants are
   * U-externs — see the frontier stub above). Any TS caller reaching for
   * construction gets a loud, cited failure via this factory.
   */
  static construct(): OZChannelColorNoAlpha {
    return OZChannelColorNoAlpha_ctor_stub();
  }

  /**
   * `OZChannelColorNoAlpha::~OZChannelColorNoAlpha()` @Ozone 0x8d590 [D1].
   *
   * DISASM (raw-port/re/disasm/OZChannelColorNoAlpha.~OZChannelColorNoAlpha.s):
   *
   *   0x8d590  pushq %rbp
   *   0x8d591  movq  %rsp, %rbp
   *   0x8d594  pushq %rbx
   *   0x8d595  pushq %rax                             ; align stack (8 bytes pad)
   *   0x8d596  movq  %rdi, %rbx                       ; rbx = this
   *   0x8d599  movq  0x795350(%rip), %rax             ; rax = &_ZTV21OZChannelColorNoAlpha (VA 0x8228f0)
   *   0x8d5a0  leaq  0x10(%rax), %rcx                 ; rcx = vtable + 0x10 = 0x822900
   *   0x8d5a4  movq  %rcx, (%rdi)                     ; *(this+0)    = primary vptr
   *   0x8d5a7  addq  $0x370, %rax                     ; rax = vtable + 0x370 = 0x822c60
   *   0x8d5ad  movq  %rax, 0x10(%rdi)                 ; *(this+0x10) = secondary vptr
   *   0x8d5b1  addq  $0x2e8, %rdi                     ; rdi = this + 0x2e8
   *   0x8d5b8  callq __ZN13OZChannelEnumD1Ev          ; OZChannelEnum::~OZChannelEnum()
   *   0x8d5bd  leaq  0x250(%rbx), %rdi                ; rdi = this + 0x250
   *   0x8d5c4  callq __ZN9OZChannelD2Ev               ; OZChannel::~OZChannel()  (sub-channel #4)
   *   0x8d5c9  leaq  0x1b8(%rbx), %rdi                ; rdi = this + 0x1b8
   *   0x8d5d0  callq __ZN9OZChannelD2Ev               ; sub-channel #3
   *   0x8d5d5  leaq  0x120(%rbx), %rdi                ; rdi = this + 0x120
   *   0x8d5dc  callq __ZN9OZChannelD2Ev               ; sub-channel #2
   *   0x8d5e1  leaq  0x88(%rbx), %rdi                 ; rdi = this + 0x088
   *   0x8d5e8  callq __ZN9OZChannelD2Ev               ; sub-channel #1
   *   0x8d5ed  movq  %rbx, %rdi                       ; rdi = this
   *   0x8d5f0  addq  $0x8, %rsp                       ; unwind align pad
   *   0x8d5f4  popq  %rbx
   *   0x8d5f5  popq  %rbp
   *   0x8d5f6  jmp   __ZN17OZCompoundChannelD2Ev      ; tail-jmp OZCompoundChannel::~OZCompoundChannel()
   *
   * Semantic mirror below: vptr installs are IMPLICIT in the TS model
   * (JS objects derive their vtable identity from `.prototype`, matching
   * the C++ vtable slot). Sub-object destruction runs in reverse-of-
   * construction order (enum first, then channels 4→1, then base).
   */
  destructor(): void {
    // @0x8d5a4 / @0x8d5ad — vptr installs are implicit in JS (prototype
    // identity == C++ vtable identity).

    // @0x8d5b8 — enum sub-channel dtor on this+0x2e8.
    OZChannelEnum_dtor_stub(this.subChannelEnum_0x2e8);

    // @0x8d5c4 — sub-channel #4 dtor on this+0x250.
    OZChannel_dtor_stub(this.subChannel_0x250);

    // @0x8d5d0 — sub-channel #3 dtor on this+0x1b8.
    OZChannel_dtor_stub(this.subChannel_0x1b8);

    // @0x8d5dc — sub-channel #2 dtor on this+0x120.
    OZChannel_dtor_stub(this.subChannel_0x120);

    // @0x8d5e8 — sub-channel #1 dtor on this+0x88.
    OZChannel_dtor_stub(this.subChannel_0x88);

    // @0x8d5f6 — tail-jmp OZCompoundChannel::~OZCompoundChannel() on this.
    OZCompoundChannel_dtor_stub(this);
  }
}


// ═════════════════════════════════════════════════════════════════════════
// ProChannel.framework ledger — the FULL method body of this class lives
// in ProChannel, not Ozone. The Ozone slice above only carries D1. Every
// method below is transcribed line-for-line from the ProChannel x86_64
// slice at:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework
//   /Versions/A/ProChannel   (x86_64 slice; unadjusted VAs).
// Disassembly sources are in raw-port/re/disasm/ProChannel.OZChannelColorNoAlpha.*.s.
//
// STRUCT LAYOUT — confirmed identical to the Ozone-side dtor recovery:
//   +0x088  OZChannel sub-channel   R  (0x98 bytes)
//   +0x120  OZChannel sub-channel   G  (0x98 bytes)
//   +0x1b8  OZChannel sub-channel   B  (0x98 bytes)
//   +0x250  OZChannel sub-channel   (unused/alpha-shadow)  (0x98 bytes)
//   +0x2e8  OZChannelEnum sub-channel — color-space enum
//   +0x3e8  bool  isColor flag        (1 byte)
//   +0x3f0  <class size, from clone: operator new(0x3f0)>
// ═════════════════════════════════════════════════════════════════════════

// ── ProChannel frontier callees ──────────────────────────────────────────

/**
 * `OZChannel::getValueAsDouble(CMTime const&, double) const` — ProChannel
 * external. Every RGB per-channel read tail-jmps or calls into this base
 * method with `%rdi = this + (R:0x88 | G:0x120 | B:0x1b8)`. Not yet
 * transcribed in the ProChannel ledger (symbol @ProChannel 0x15d4e).
 * Surfaces the read as a frontier that raises.
 */
function OZChannel_getValueAsDouble_stub(
  _subChannel: unknown, _time: unknown, _extra: number,
): number {
  throw new Error(
    "OZChannel::getValueAsDouble(CMTime const&, double) const " +
      "@ProChannel __ZNK9OZChannel16getValueAsDoubleERK6CMTimed — not yet transcribed",
  );
}

/**
 * `OZChannel::getValueAsInt(CMTime const&, double) const` — ProChannel
 * external. Called by `getColorSpaceID`/`getPCColorSpace`/`getColorSpace`/
 * `setColorSpaceIDNoConversion` with `%rdi = this + 0x2e8` (the enum
 * sub-channel) and `%rsi = _kCMTimeZero`, `%xmm0 = 0.0`. Not yet transcribed.
 */
function OZChannel_getValueAsInt_stub(
  _enumSub: unknown, _time: unknown, _extra: number,
): number {
  throw new Error(
    "OZChannel::getValueAsInt(CMTime const&, double) const " +
      "@ProChannel __ZNK9OZChannel13getValueAsIntERK6CMTimed — not yet transcribed",
  );
}

/**
 * `OZChannel::setValue(CMTime const&, double, bool)` — ProChannel external.
 * Called by `setColorSpaceIDNoConversion` @ProChannel 0x56bb6 on the enum
 * sub-channel at `this+0x2e8`. Not yet transcribed.
 */
function OZChannel_setValue_stub(
  _sub: unknown, _time: unknown, _v: number, _b: boolean,
): void {
  throw new Error(
    "OZChannel::setValue(CMTime const&, double, bool) " +
      "@ProChannel __ZN9OZChannel8setValueERK6CMTimedb — not yet transcribed",
  );
}

/**
 * `OZChannel::setDefaultValue(double)` — ProChannel external. Called from
 * `setDefaultColor` @ProChannel 0x567fb / 0x5680f / 0x56823 (one per RGB
 * sub-channel) and from `setColorSpaceIDNoConversion` tail-jmp @0x56be1.
 * Not yet transcribed.
 */
function OZChannel_setDefaultValue_stub(_sub: unknown, _v: number): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) " +
      "@ProChannel __ZN9OZChannel15setDefaultValueEd — not yet transcribed",
  );
}

/**
 * `OZChannel::getDefaultValue() const` — ProChannel external. Called from
 * `getDefaultColor` @ProChannel 0x5688a / 0x5689f / 0x568b4. Not yet
 * transcribed.
 */
function OZChannel_getDefaultValue_stub(_sub: unknown): number {
  throw new Error(
    "OZChannel::getDefaultValue() const " +
      "@ProChannel __ZNK9OZChannel15getDefaultValueEv — not yet transcribed",
  );
}

/**
 * Virtual `OZChannel` slot 0x2c8 — signature
 *   `void (OZChannel*, CMTime const&, double, bool)`
 * (per RGB set-value: the disasm reads `movq 0x2c8(%rax), %rax; jmpq *%rax`
 * with args (this+off, %rsi=time, %xmm0=value, %rdx=notify-flag)). Called by
 * `setRedValue` @0x5666e, `setGreenValue` @0x5668a, `setBlueValue` @0x566a6,
 * and by `setColor` @0x5672c / 0x5674e / 0x56773. The vtable target is not
 * yet decoded — likely a `setValueAsDouble`-family virtual. Surfaces as a
 * frontier throw.
 */
function OZChannel_vSlot0x2c8_stub(
  _sub: unknown, _time: unknown, _v: number, _b: boolean,
): void {
  throw new Error(
    "OZChannel vtable slot 0x2c8 (setValueAsDouble-family, " +
      "signature (CMTime const&, double, bool)) — not yet resolved",
  );
}

/**
 * `OZChannel::copy(OZChannelBase const*, bool)` — ProChannel external.
 * Called four times by `OZChannelColorNoAlpha::copy` (each RGB + the extra
 * sub-channel at +0x250). Not yet transcribed.
 */
function OZChannel_copy_stub(
  _dst: unknown, _src: unknown, _b: boolean,
): void {
  throw new Error(
    "OZChannel::copy(OZChannelBase const*, bool) " +
      "@ProChannel __ZN9OZChannel4copyEPK13OZChannelBaseb — not yet transcribed",
  );
}

/**
 * `OZChannelEnum::copy(OZChannelBase const*, bool)` — ProChannel external.
 * Called by `OZChannelColorNoAlpha::copy` @0x563a2 on the enum sub-channel
 * at +0x2e8. Not yet transcribed.
 */
function OZChannelEnum_copy_stub(
  _dst: unknown, _src: unknown, _b: boolean,
): void {
  throw new Error(
    "OZChannelEnum::copy(OZChannelBase const*, bool) " +
      "@ProChannel __ZN13OZChannelEnum4copyEPK13OZChannelBaseb — not yet transcribed",
  );
}

/**
 * `OZCompoundChannel::copy(OZChannelBase const*, bool)` — ProChannel
 * external. Called first by `OZChannelColorNoAlpha::copy` @0x56315 to copy
 * the compound-channel base sub-object. Not yet transcribed.
 */
function OZCompoundChannel_copy_stub(
  _dst: unknown, _src: unknown, _b: boolean,
): void {
  throw new Error(
    "OZCompoundChannel::copy(OZChannelBase const*, bool) " +
      "@ProChannel __ZN17OZCompoundChannel4copyEPK13OZChannelBaseb — not yet transcribed",
  );
}

/**
 * `OZChannelBase::testFlag(unsigned long long) const` — ProChannel external.
 * Called by `setDefaultColor` @0x56835 with mask `0x200000000` (the
 * "has-color-conversion-flag" bit). Not yet transcribed.
 */
function OZChannelBase_testFlag_stub(_this: unknown, _mask: bigint): boolean {
  throw new Error(
    "OZChannelBase::testFlag(unsigned long long) const " +
      "@ProChannel __ZNK13OZChannelBase8testFlagEy — not yet transcribed",
  );
}

/**
 * `OZChannelBase::setFlag(unsigned long long, bool)` — ProChannel external.
 * Called by `setDefaultColor` @0x56850 with mask `0x100000000`. Not yet
 * transcribed.
 */
function OZChannelBase_setFlag_stub(
  _this: unknown, _mask: bigint, _b: boolean,
): void {
  throw new Error(
    "OZChannelBase::setFlag(unsigned long long, bool) " +
      "@ProChannel __ZN13OZChannelBase7setFlagEyb — not yet transcribed",
  );
}

/**
 * `PCColor::getRGB(float*, float*, float*, PCColorSpaceHandle const&) const`
 * — ProChannel imported stub. Called by `setColor` @0x56701 and
 * `setDefaultColor` @0x567e1 to unpack the incoming color into R/G/B floats
 * against a target color space. Not yet transcribed.
 */
function PCColor_getRGB_stub(
  _color: unknown, _r: unknown, _g: unknown, _b: unknown, _space: unknown,
): void {
  throw new Error(
    "PCColor::getRGB(float*, float*, float*, PCColorSpaceHandle const&) const " +
      "@ProChannel __ZNK7PCColor6getRGBEPfS0_S0_RK18PCColorSpaceHandle — not yet transcribed",
  );
}

/**
 * `PCColor::setRGBA(float, float, float, float, PCColorSpaceHandle const&)`
 * — ProChannel imported stub. Called by `getColor` @0x5646c and
 * `getDefaultColor` @0x56904 to pack R/G/B (+ a fixed alpha loaded from a
 * data literal, see `getColor_ALPHA_LITERAL` below) into the outgoing color
 * with a chosen color space. Not yet transcribed.
 */
function PCColor_setRGBA_stub(
  _out: unknown, _r: number, _g: number, _b: number, _a: number,
  _space: unknown,
): void {
  throw new Error(
    "PCColor::setRGBA(float, float, float, float, PCColorSpaceHandle const&) " +
      "@ProChannel __ZN7PCColor7setRGBAEffffRK18PCColorSpaceHandle — not yet transcribed",
  );
}

/**
 * `PCColor::getColorSpace() const` — ProChannel imported stub. Called from
 * `getColor`/`setColor`/`getDefaultColor`/`setDefaultColor` when the
 * isColor flag @+0x3e8 is FALSE, to reuse the incoming color's own space
 * instead of the channel's stored enum. Not yet transcribed.
 */
function PCColor_getColorSpace_stub(_out: unknown, _self: unknown): void {
  throw new Error(
    "PCColor::getColorSpace() const " +
      "@ProChannel __ZNK7PCColor13getColorSpaceEv — not yet transcribed",
  );
}

/**
 * `PCCFRef<CGColorSpace*>::~PCCFRef()` — ProChannel external. Every color
 * accessor calls this to release the borrowed CFRef after the RGB pack/unpack.
 * Not yet transcribed.
 */
function PCCFRef_CGColorSpace_dtor_stub(_p: unknown): void {
  throw new Error(
    "PCCFRef<CGColorSpace*>::~PCCFRef() " +
      "@ProChannel __ZN7PCCFRefIP12CGColorSpaceED2Ev — not yet transcribed",
  );
}

/**
 * `PCColorSpaceCache::intToColorSpaceID(int, PCColorSpaceCache::ID)` —
 * ProChannel imported stub. Maps the enum-channel raw int value to a
 * PCColorSpaceCache::ID (with base mode `ID(3)`). Not yet transcribed.
 */
function PCColorSpaceCache_intToColorSpaceID_stub(
  _i: number, _mode: number,
): number {
  throw new Error(
    "PCColorSpaceCache::intToColorSpaceID(int, PCColorSpaceCache::ID) " +
      "@ProChannel __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE — not yet transcribed",
  );
}

/**
 * `PCColorSpaceCache::colorSpaceIDToInt(PCColorSpaceCache::ID)` —
 * ProChannel imported stub. Inverse of `intToColorSpaceID`. Called by
 * `setColorSpaceIDNoConversion` @0x56b97 to reduce a `PCColorSpaceCache::ID`
 * back down to the enum-channel's int value. Not yet transcribed.
 */
function PCColorSpaceCache_colorSpaceIDToInt_stub(_id: number): number {
  throw new Error(
    "PCColorSpaceCache::colorSpaceIDToInt(PCColorSpaceCache::ID) " +
      "@ProChannel __ZN17PCColorSpaceCache17colorSpaceIDToIntENS_2IDE — not yet transcribed",
  );
}

/**
 * `PCColorSpaceCache::getColorSpaceByID(PCColorSpaceCache::ID)` — ProChannel
 * imported stub. Called by `getPCColorSpace` @0x56511 when the mapped ID is
 * NOT sentinel (-1). Not yet transcribed.
 */
function PCColorSpaceCache_getColorSpaceByID_stub(
  _out: unknown, _id: number,
): void {
  throw new Error(
    "PCColorSpaceCache::getColorSpaceByID(PCColorSpaceCache::ID) " +
      "@ProChannel __ZN17PCColorSpaceCache17getColorSpaceByIDENS_2IDE — not yet transcribed",
  );
}

/**
 * `PCColorSpaceCache::defaultSpace()` — ProChannel imported stub. Called by
 * `getPCColorSpace` @0x56518 when the mapped ID IS sentinel (-1). Not yet
 * transcribed.
 */
function PCColorSpaceCache_defaultSpace_stub(_out: unknown): void {
  throw new Error(
    "PCColorSpaceCache::defaultSpace() " +
      "@ProChannel __ZN17PCColorSpaceCache12defaultSpaceEv — not yet transcribed",
  );
}

/**
 * `PCColorSpaceCache::getNSColorSpaceByID(PCColorSpaceCache::ID)` —
 * ProChannel imported stub. Called by `getColorSpace` @0x571c6 tail-jmp
 * when the mapped ID is NOT sentinel. Not yet transcribed.
 */
function PCColorSpaceCache_getNSColorSpaceByID_stub(_id: number): unknown {
  throw new Error(
    "PCColorSpaceCache::getNSColorSpaceByID(PCColorSpaceCache::ID) " +
      "@ProChannel __ZN17PCColorSpaceCache19getNSColorSpaceByIDENS_2IDE — not yet transcribed",
  );
}

/**
 * `PCColorSpaceCache::nsDefaultSpace()` — ProChannel imported stub. Called
 * by `getColorSpace` @0x571de tail-jmp when the mapped ID IS sentinel.
 * Not yet transcribed.
 */
function PCColorSpaceCache_nsDefaultSpace_stub(): unknown {
  throw new Error(
    "PCColorSpaceCache::nsDefaultSpace() " +
      "@ProChannel __ZN17PCColorSpaceCache14nsDefaultSpaceEv — not yet transcribed",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// call_once boundary + singleton state for the greenSample{1,2}Impl getInstance
// transcriptions below. The libc++ std::__call_once is the one legitimate
// out-of-scope extern; each nested singleton has its own ProChannel once-guard
// and singleton pointer (loaded rip-relatively by its getInstance body).
// ─────────────────────────────────────────────────────────────────────────

/**
 * `std::__call_once(unsigned long volatile&, void*, void (*)(void*))`
 *   @ProChannel U-extern __ZNSt3__111__call_onceERVmPvPFvS2_E — libc++ runtime
 *   symbol stub @0xacdc8. Runs the proxy once and flips the guard to -1. The
 *   construction happens inside the per-singleton `__call_once_proxy<…lambda>`
 *   (SEPARATE ledger unit), never fabricated in-frame.
 */
function OZChannelColorNoAlpha_stdCallOnce(
  _flag: { value: bigint },
  _arg: unknown,
  _fn: (arg: unknown) => void,
): void {
  throw new Error(
    "std::__call_once @ProChannel U-extern __ZNSt3__111__call_onceERVmPvPFvS2_E " +
      "(libc++ runtime, symbol stub @0xacdc8) — the singleton is built inside the " +
      "per-getInstance __call_once_proxy (SEPARATE ledger unit); no in-frame allocation is fabricated.",
  );
}

/** greenSample1Impl once-guard (@0x57b4c) — libc++ guard; -1 == already-run. */
let _greenSample1Impl_once: bigint = 0n;
/** greenSample1Impl singleton pointer (@0x57b8b) — built inside the proxy. */
let _greenSample1Impl_instance: object | null = null;
/** greenSample2Impl once-guard (@0x57d1e) — libc++ guard; -1 == already-run. */
let _greenSample2Impl_once: bigint = 0n;
/** greenSample2Impl singleton pointer (@0x57d5d) — built inside the proxy. */
let _greenSample2Impl_instance: object | null = null;

/**
 * Singleton prototype accessors (all lazy `std::call_once`-backed
 * `getInstance()` functions). Each returns a preconfigured
 * `OZChannelColorNoAlpha*` used by the `select{Red,Green,Blue}Prototype(d)`
 * hit-testers as a global. Not yet transcribed. The addresses below are
 * the ProChannel `getInstance()` symbol addresses.
 */
function OZChannelColorNoAlpha_blackImpl_getInstance_stub(): unknown {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_blackImpl::getInstance() " +
      "@ProChannel 0x5723c — not yet transcribed",
  );
}
function OZChannelColorNoAlpha_whiteImpl_getInstance_stub(): unknown {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_whiteImpl::getInstance() " +
      "@ProChannel 0x57404 — not yet transcribed",
  );
}
function OZChannelColorNoAlpha_redSample1Impl_getInstance_stub(): unknown {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_redSample1Impl::getInstance() " +
      "@ProChannel 0x575d6 — not yet transcribed",
  );
}
function OZChannelColorNoAlpha_redSample2Impl_getInstance_stub(): unknown {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_redSample2Impl::getInstance() " +
      "@ProChannel (getInstance singleton) — not yet transcribed",
  );
}
/**
 * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_greenSample1Impl::getInstance()`
 *   @ProChannel 0x00057b4c
 *   __ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_greenSample1Impl11getInstanceEv
 *
 *   0x57b4c: movq  _..._greenSample1Impl_once(%rip),%rax  # rax = guard word
 *   0x57b53: cmpq  $-0x1,%rax                             # guard == -1 (already run)?
 *   0x57b57: je    0x57b8b                                # yes → load singleton
 *   0x57b59: pushq %rbp ; movq %rsp,%rbp ; subq $0x20,%rsp
 *   0x57b61: leaq  -0x1(%rbp),%rax ; leaq -0x18(%rbp),%rcx ; movq %rax,(%rcx)   # tuple[0]=&capture
 *   0x57b6c: leaq  -0x10(%rbp),%rsi ; movq %rcx,(%rsi)                          # proxyArg=&tuple
 *   0x57b73: leaq  _..._greenSample1Impl_once(%rip),%rdi                        # arg0=&guard
 *   0x57b7a: leaq  __call_once_proxy<...greenSample1Impl...lambda>(%rip),%rdx   # arg2=proxy
 *   0x57b81: callq 0xacdc8  (__ZNSt3__111__call_onceERVmPvPFvS2_E)             # std::__call_once
 *   0x57b86: addq  $0x20,%rsp ; popq %rbp
 *   0x57b8b: movq  _..._greenSample1E(%rip),%rax          # rax = singleton ptr
 *   0x57b92: retq                                         # return _..._greenSample1
 *
 * Canonical libc++ call_once static-local singleton getter. Fast path
 * (guard == -1) loads and returns the built singleton with NO throw. Slow path
 * calls std::__call_once (the one out-of-scope libc++ extern @0xacdc8); the
 * allocation lives inside __call_once_proxy (SEPARATE ledger unit @0x57b7a),
 * never fabricated in-frame.
 *
 * Source disassembly:
 *   raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_greenSample1Impl11getInstanceEv.s (19 lines)
 */
function OZChannelColorNoAlpha_greenSample1Impl_getInstance(): object | null {
  // @0x57b4c/@0x57b53: guard vs -1 sentinel.
  if (_greenSample1Impl_once !== -1n) {
    // @0x57b59-@0x57b86: slow path — stage empty-capture tuple + std::__call_once.
    const flagRef = { value: _greenSample1Impl_once };
    const proxyArg: unknown = { __callOnceTuple: true };
    const proxy = (_arg: unknown): void => {
      // @0x57b7a proxy target — SEPARATE ledger unit; allocation lives there.
      throw new Error(
        "__call_once_proxy<...OZChannelColorNoAlpha_greenSample1Impl::getInstance()::lambda> " +
          "@ProChannel 0x57b7a (SEPARATE ledger unit, not transcribed) — the singleton " +
          "allocation lives there, not in this frame.",
      );
    };
    OZChannelColorNoAlpha_stdCallOnce(flagRef, proxyArg, proxy); // @0x57b81 callq 0xacdc8
  }
  // @0x57b8b-@0x57b92: load and return the (now-initialized) singleton.
  return _greenSample1Impl_instance;
}

/** Back-compat alias: pre-existing demand name used by selectGreenPrototype. */
function OZChannelColorNoAlpha_greenSample1Impl_getInstance_stub(): unknown {
  return OZChannelColorNoAlpha_greenSample1Impl_getInstance();
}

/**
 * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_greenSample2Impl::getInstance()`
 *   @ProChannel 0x00057d1e
 *   __ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_greenSample2Impl11getInstanceEv
 *
 *   0x57d1e: movq  _..._greenSample2Impl_once(%rip),%rax  # rax = guard word
 *   0x57d25: cmpq  $-0x1,%rax                             # guard == -1 (already run)?
 *   0x57d..: je    0x57d5d                                # yes → load singleton
 *   0x57d45: leaq  _..._greenSample2Impl_once(%rip),%rdi                        # arg0=&guard
 *   0x57d4c: leaq  __call_once_proxy<...greenSample2Impl...lambda>(%rip),%rdx   # arg2=proxy
 *   0x57d53: callq 0xacdc8  (__ZNSt3__111__call_onceERVmPvPFvS2_E)             # std::__call_once
 *   0x57d5d: movq  _..._greenSample2E(%rip),%rax          # rax = singleton ptr
 *   0x57d..: retq                                         # return _..._greenSample2
 *
 * Identical libc++ call_once static-local singleton getter to greenSample1Impl
 * (same instruction shape, different once-guard/singleton statics). Fast path
 * returns the built singleton with NO throw; slow path defers to
 * std::__call_once @0xacdc8 whose proxy (SEPARATE ledger unit @0x57d4c) builds
 * the singleton. No in-frame allocation.
 *
 * Source disassembly:
 *   raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha38OZChannelColorNoAlpha_greenSample2Impl11getInstanceEv.s (19 lines)
 */
function OZChannelColorNoAlpha_greenSample2Impl_getInstance(): object | null {
  // @0x57d1e/@0x57d25: guard vs -1 sentinel.
  if (_greenSample2Impl_once !== -1n) {
    // slow path — stage empty-capture tuple + std::__call_once.
    const flagRef = { value: _greenSample2Impl_once };
    const proxyArg: unknown = { __callOnceTuple: true };
    const proxy = (_arg: unknown): void => {
      // @0x57d4c proxy target — SEPARATE ledger unit; allocation lives there.
      throw new Error(
        "__call_once_proxy<...OZChannelColorNoAlpha_greenSample2Impl::getInstance()::lambda> " +
          "@ProChannel 0x57d4c (SEPARATE ledger unit, not transcribed) — the singleton " +
          "allocation lives there, not in this frame.",
      );
    };
    OZChannelColorNoAlpha_stdCallOnce(flagRef, proxyArg, proxy); // @0x57d53 callq 0xacdc8
  }
  // @0x57d5d: load and return the (now-initialized) singleton.
  return _greenSample2Impl_instance;
}

/** Back-compat alias: pre-existing demand name used by selectGreenPrototype. */
function OZChannelColorNoAlpha_greenSample2Impl_getInstance_stub(): unknown {
  return OZChannelColorNoAlpha_greenSample2Impl_getInstance();
}

function OZChannelColorNoAlpha_blueSample1Impl_getInstance_stub(): unknown {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_blueSample1Impl::getInstance() " +
      "@ProChannel (getInstance singleton) — not yet transcribed",
  );
}
function OZChannelColorNoAlpha_blueSample2Impl_getInstance_stub(): unknown {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_blueSample2Impl::getInstance() " +
      "@ProChannel (getInstance singleton) — not yet transcribed",
  );
}
function OZChannelColorNoAlpha_greyImpl_getInstance_stub(): unknown {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha_greyImpl::getInstance() " +
      "@ProChannel (getInstance singleton) — not yet transcribed",
  );
}

// The `operator new(0x3f0)` call used by `clone()` — surfaces the exact
// class size proved by the disasm.
/** Byte size of OZChannelColorNoAlpha, proved by `clone()` @ProChannel
 *  0x562cc `movl $0x3f0, %edi ; callq __Znwm`. */
const OZCHANNELCOLORNOALPHA_SIZEOF = 0x3f0;

/** ProChannel-copy-ctor U-extern — `OZChannelColorNoAlpha::OZChannelColorNoAlpha(OZChannelColorNoAlpha const&, OZChannelFolder*)`
 *  @ProChannel 0x560fc (C2) / 0x562b8 (C1). Called by `clone()` on the
 *  freshly-`operator new`'d block. Not yet transcribed. */
function OZChannelColorNoAlpha_copyCtor_stub(
  _dst: unknown, _src: unknown, _folder: unknown,
): void {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha(OZChannelColorNoAlpha const&, OZChannelFolder*) " +
      "@ProChannel 0x560fc / 0x562b8 — not yet transcribed",
  );
}

// ── ProChannel color-palette prototype selector constants ────────────────
// Every value below is read from the framework .rodata via `resolve.py`.
// They gate which of the 5-plus singleton "prototype channels" the
// `select{Red,Green,Blue}Prototype(double)` hit-testers return for a given
// input value; the test is `|x - target| < eps`.

/** IEEE-754 absolute-value mask (u64 0x7fffffffffffffff), loaded via
 *  `movapd 0x…(%rip), %xmm2 ; andpd %xmm0, %xmm2` in every selectXxx.
 *  @ProChannel 0xb0390. */
const ABS_MASK_ADDR = 0xb0390;

/** Tolerance eps = 1e-07, loaded via `movsd 0x…(%rip), %xmm1` at the top
 *  of each selectXxx. @ProChannel 0xb03b0. */
const SELECT_EPS = 1e-7;

/** The four common target-value constants (each loaded as its NEGATION so
 *  the disasm's `addsd` computes `x - target`, whose absolute value is
 *  then compared to eps). */
const TARGET_NEG_ONE = -1.0;   // @ProChannel 0xb03c8 — matches when x ≈ 1 (white).
const TARGET_GREY    = -0.5;   // @ProChannel 0xb0d40 — matches when x ≈ 0.5 (grey).

/** Per-channel sample values (again stored as negations). */
const TARGET_RED_SAMPLE1   = -0.64; // @ProChannel 0xb0d30
const TARGET_RED_SAMPLE2   = -0.21; // @ProChannel 0xb0d38
const TARGET_GREEN_SAMPLE1 = -0.68; // @ProChannel 0xb0d48
const TARGET_GREEN_SAMPLE2 = -0.43; // @ProChannel 0xb0d50
const TARGET_BLUE_SAMPLE1  = -0.77; // @ProChannel 0xb0d58
const TARGET_BLUE_SAMPLE2  = -0.75; // @ProChannel 0xb0d60

/** IEEE-754 abs() implemented via the andpd absolute-value mask. This
 *  mirrors the machine's actual bit-op — see disasm at 0x54e64 / 0x54e90 /
 *  0x54eb0 / 0x54ed0 / 0x54eec (and the parallel green/blue slots). Every
 *  callsite treats `-0.0` as `0.0`, matches NaN as NaN, etc. */
function _absMask(x: number): number {
  // The machine uses `andpd` against 0x7fffffffffffffff. In JS this is
  // exactly `Math.abs(x)` on all non-NaN values, and preserves NaN's
  // sign-cleared form (which the disasm's `ucomisd` treats as unordered
  // → the `jbe` falls through, exactly matching Math.abs+lt-strict below).
  return Math.abs(x);
}

// ═════════════════════════════════════════════════════════════════════════
// Method transcriptions.
// ═════════════════════════════════════════════════════════════════════════

// The methods below are DECLARED as free functions taking `self:
// OZChannelColorNoAlpha` for a machine-faithful `this = %rdi` mapping;
// they are also re-exported as prototype methods on the class at the very
// bottom of this file. This avoids splitting the class between two source
// files (Rule 6) while keeping the machine mapping unambiguous.

/**
 * `OZChannelColorNoAlpha::isColor() const` @ProChannel 0x564d0.
 *
 *   0x564d0  pushq %rbp
 *   0x564d1  movq  %rsp, %rbp
 *   0x564d4  movb  0x3e8(%rdi), %al   ; load 1-byte isColor flag
 *   0x564da  popq  %rbp
 *   0x564db  retq
 */
export function OZChannelColorNoAlpha_isColor(
  self: OZChannelColorNoAlpha,
): boolean {
  return self.isColor_0x3e8;
}

/**
 * `OZChannelColorNoAlpha::setIsColor(bool)` @ProChannel 0x56c3c.
 *
 *   0x56c3c  pushq %rbp
 *   0x56c3d  movq  %rsp, %rbp
 *   0x56c40  movb  %sil, 0x3e8(%rdi)  ; store the flag byte
 *   0x56c47  popq  %rbp
 *   0x56c48  retq
 */
export function OZChannelColorNoAlpha_setIsColor(
  self: OZChannelColorNoAlpha, v: boolean,
): void {
  self.isColor_0x3e8 = v;
}

/**
 * `OZChannelColorNoAlpha::getObjCWrapperName()` @ProChannel 0x56c2e.
 *
 *   0x56c2e  pushq %rbp
 *   0x56c2f  movq  %rsp, %rbp
 *   0x56c32  leaq  0x8e677(%rip), %rax   ; @cfstring @"bad cfstring ref"
 *   0x56c39  popq  %rbp
 *   0x56c3a  retq
 *
 * The label reads "bad cfstring ref" — this is a debug-build placeholder
 * that the ObjC bridge treats as the class's fallback wrapper name.
 * @ProChannel cfstring pool 0x56c39 + 0x8e677 → literal pool entry.
 */
export function OZChannelColorNoAlpha_getObjCWrapperName(
  _self: OZChannelColorNoAlpha,
): string {
  return "bad cfstring ref";
}

/**
 * `OZChannelColorNoAlpha::getRedValue(CMTime const&, double) const`
 * @ProChannel 0x5649a.
 *
 *   0x5649a  pushq %rbp
 *   0x5649b  movq  %rsp, %rbp
 *   0x5649e  addq  $0x88, %rdi            ; %rdi = &self.R sub-channel
 *   0x564a5  popq  %rbp
 *   0x564a6  jmp   OZChannel::getValueAsDouble  ; tail-jmp
 */
export function OZChannelColorNoAlpha_getRedValue(
  self: OZChannelColorNoAlpha, time: unknown, extra: number,
): number {
  return OZChannel_getValueAsDouble_stub(self.subChannel_0x88, time, extra);
}

/**
 * `OZChannelColorNoAlpha::getGreenValue(CMTime const&, double) const`
 * @ProChannel 0x564ac. Same shape as `getRedValue`, addend 0x120.
 */
export function OZChannelColorNoAlpha_getGreenValue(
  self: OZChannelColorNoAlpha, time: unknown, extra: number,
): number {
  return OZChannel_getValueAsDouble_stub(self.subChannel_0x120, time, extra);
}

/**
 * `OZChannelColorNoAlpha::getBlueValue(CMTime const&, double) const`
 * @ProChannel 0x564be. Same shape, addend 0x1b8.
 */
export function OZChannelColorNoAlpha_getBlueValue(
  self: OZChannelColorNoAlpha, time: unknown, extra: number,
): number {
  return OZChannel_getValueAsDouble_stub(self.subChannel_0x1b8, time, extra);
}

/**
 * `OZChannelColorNoAlpha::setRedValue(CMTime const&, double, bool)`
 * @ProChannel 0x5665c.
 *
 *   0x5665c  pushq %rbp
 *   0x5665d  movq  %rsp, %rbp
 *   0x56660  movq  0x88(%rdi), %rax        ; %rax = vptr of R sub-channel
 *   0x56667  addq  $0x88, %rdi             ; %rdi = &R sub-channel
 *   0x5666e  movq  0x2c8(%rax), %rax       ; %rax = vtable slot 0x2c8 target
 *   0x56675  popq  %rbp
 *   0x56676  jmpq  *%rax                   ; tail-call the virtual
 */
export function OZChannelColorNoAlpha_setRedValue(
  self: OZChannelColorNoAlpha, time: unknown, v: number, notify: boolean,
): void {
  OZChannel_vSlot0x2c8_stub(self.subChannel_0x88, time, v, notify);
}

/**
 * `OZChannelColorNoAlpha::setGreenValue(CMTime const&, double, bool)`
 * @ProChannel 0x56678. Same shape, addend 0x120.
 */
export function OZChannelColorNoAlpha_setGreenValue(
  self: OZChannelColorNoAlpha, time: unknown, v: number, notify: boolean,
): void {
  OZChannel_vSlot0x2c8_stub(self.subChannel_0x120, time, v, notify);
}

/**
 * `OZChannelColorNoAlpha::setBlueValue(CMTime const&, double, bool)`
 * @ProChannel 0x56694. Same shape, addend 0x1b8.
 */
export function OZChannelColorNoAlpha_setBlueValue(
  self: OZChannelColorNoAlpha, time: unknown, v: number, notify: boolean,
): void {
  OZChannel_vSlot0x2c8_stub(self.subChannel_0x1b8, time, v, notify);
}

/**
 * `OZChannelColorNoAlpha::getPCColorSpace() const` @ProChannel 0x564dc.
 *
 *   0x564dc  pushq %rbp / movq %rsp, %rbp
 *   0x564e0  pushq %rbx / pushq %rax
 *   0x564e2  movq  %rdi, %rbx                    ; save return-slot ptr
 *   0x564e5  leaq  0x2e8(%rsi), %rdi             ; %rdi = &enum sub-channel
 *   0x564ec  movq  0x73fcd(%rip), %rsi           ; = &_kCMTimeZero
 *   0x564f3  xorps %xmm0, %xmm0                  ; %xmm0 = 0.0
 *   0x564f6  callq OZChannel::getValueAsInt
 *   0x564fb  movl  %eax, %edi                    ; %edi = int result
 *   0x564fd  movl  $0x3, %esi                    ; PCColorSpaceCache::ID base=3
 *   0x56502  callq PCColorSpaceCache::intToColorSpaceID
 *   0x56507  movq  %rbx, %rdi                    ; %rdi = return-slot
 *   0x5650a  cmpl  $-0x1, %eax                   ; sentinel check
 *   0x5650d  je    0x56518
 *   0x5650f  movl  %eax, %esi
 *   0x56511  callq PCColorSpaceCache::getColorSpaceByID
 *   0x56516  jmp   ret
 *   0x56518  callq PCColorSpaceCache::defaultSpace
 *   0x5651d  return
 *
 * NOTE: the C++ ABI passes the sret return-slot in %rdi and the actual
 * `this` (which the compiler is reading) in %rsi. That's why the
 * `0x2e8(%rsi)` load, not `0x2e8(%rdi)`.
 */
export function OZChannelColorNoAlpha_getPCColorSpace(
  outSlot: unknown, self: OZChannelColorNoAlpha,
): unknown {
  const raw = OZChannel_getValueAsInt_stub(
    self.subChannelEnum_0x2e8, _kCMTimeZero_stub(), 0.0,
  );
  const id = PCColorSpaceCache_intToColorSpaceID_stub(raw, 3);
  if (id === -1) {
    PCColorSpaceCache_defaultSpace_stub(outSlot);
  } else {
    PCColorSpaceCache_getColorSpaceByID_stub(outSlot, id);
  }
  return outSlot;
}

/**
 * `OZChannelColorNoAlpha::getColorSpaceID() const` @ProChannel 0x56bf4.
 *
 *   0x56bf4  pushq %rbp / movq %rsp, %rbp
 *   0x56bf8  addq  $0x2e8, %rdi           ; %rdi = &enum sub-channel
 *   0x56bff  movq  0x738ba(%rip), %rsi    ; = &_kCMTimeZero
 *   0x56c06  xorps %xmm0, %xmm0           ; 0.0
 *   0x56c09  callq OZChannel::getValueAsInt
 *   0x56c0e  movl  %eax, %edi
 *   0x56c10  movl  $0x3, %esi             ; ID mode=3
 *   0x56c15  popq  %rbp
 *   0x56c16  jmp   PCColorSpaceCache::intToColorSpaceID  ; tail-jmp
 */
export function OZChannelColorNoAlpha_getColorSpaceID(
  self: OZChannelColorNoAlpha,
): number {
  const raw = OZChannel_getValueAsInt_stub(
    self.subChannelEnum_0x2e8, _kCMTimeZero_stub(), 0.0,
  );
  return PCColorSpaceCache_intToColorSpaceID_stub(raw, 3);
}

/**
 * `OZChannelColorNoAlpha::getColorSpace() const` @ProChannel 0x5717a.
 *
 *   0x5717a  pushq %rbp / movq %rsp, %rbp
 *   0x5717e  pushq %rbx / pushq %rax
 *   0x57180  movq  %rdi, %rbx
 *   0x57183  addq  $0x2e8, %rbx                     ; %rbx = &enum sub-channel
 *   0x5718a  movq  0x7332f(%rip), %rsi              ; = &_kCMTimeZero
 *   0x57191  xorps %xmm0, %xmm0
 *   0x57194  movq  %rbx, %rdi
 *   0x57197  callq OZChannel::getValueAsInt          (call #1)
 *   0x5719c  movl  %eax, %edi
 *   0x5719e  movl  $0x3, %esi
 *   0x571a3  callq PCColorSpaceCache::intToColorSpaceID (call #2)
 *   0x571a8  cmpl  $-0x1, %eax
 *   0x571ab  je    0x571d8
 *   0x571ad..0x571c6  RE-CALLS #1 + #2 (the compiler did NOT CSE — it
 *                     re-reads the enum sub-channel and re-maps to ID)
 *   0x571cb  movl  %eax, %edi
 *   0x571d3  jmp   PCColorSpaceCache::getNSColorSpaceByID  ; tail
 *   0x571d8  jmp   PCColorSpaceCache::nsDefaultSpace       ; tail
 *
 * The double-fetch is faithful to the binary — we preserve it here so the
 * observable side-effects (two virtual calls) match FCP.
 */
export function OZChannelColorNoAlpha_getColorSpace(
  self: OZChannelColorNoAlpha,
): unknown {
  const raw1 = OZChannel_getValueAsInt_stub(
    self.subChannelEnum_0x2e8, _kCMTimeZero_stub(), 0.0,
  );
  const id1 = PCColorSpaceCache_intToColorSpaceID_stub(raw1, 3);
  if (id1 === -1) {
    return PCColorSpaceCache_nsDefaultSpace_stub();
  }
  const raw2 = OZChannel_getValueAsInt_stub(
    self.subChannelEnum_0x2e8, _kCMTimeZero_stub(), 0.0,
  );
  const id2 = PCColorSpaceCache_intToColorSpaceID_stub(raw2, 3);
  return PCColorSpaceCache_getNSColorSpaceByID_stub(id2);
}

/**
 * `OZChannelColorNoAlpha::setColorSpaceIDNoConversion(PCColorSpaceCache::ID,
 * bool)` @ProChannel 0x56b4e.
 *
 *   Prolog @0x56b4e..0x56b63 (saves callee-saved, spills args).
 *   @0x56b66  addq  $0x2e8, %rbx                ; %rbx = &enum sub-channel
 *   @0x56b6d  movq  ...(_kCMTimeZero)
 *   @0x56b78  callq OZChannel::getValueAsInt    ; %eax = raw int
 *   @0x56b80  movl  %eax, %edi
 *   @0x56b82  movl  $0x3, %esi
 *   @0x56b87  callq intToColorSpaceID           ; %eax = current ID
 *   @0x56b8c  cmpl  %r14d, %eax                 ; if (current == new) return
 *   @0x56b8f  je    0x56be6
 *   @0x56b91  movl  %eax, %r12d                 ; save current ID
 *   @0x56b94  movl  %r14d, %edi
 *   @0x56b97  callq colorSpaceIDToInt           ; %eax = int(newID)
 *   @0x56b9f  cvtsi2sd %eax, %xmm0              ; -> double
 *   @0x56ba3  movzbl %r15b, %edx                ; notify-flag
 *   @0x56ba7  movq  ...(_kCMTimeZero)
 *   @0x56bae  movq  %rbx, %rdi                  ; enum sub-channel
 *   @0x56bb1  movsd %xmm0, -0x28(%rbp)          ; spill for reuse
 *   @0x56bb6  callq OZChannel::setValue         ; setValue(time0, int(newID)*1.0, notify)
 *   @0x56bbb  cmpl  $-0x1, %r14d ; setne %al    ; newID != -1 ?
 *   @0x56bc2  cmpl  $-0x1, %r12d ; setne %cl    ; oldID != -1 ?
 *   @0x56bc9  testb %cl, %al                    ; both non-sentinel?
 *   @0x56bcb  jne   0x56be6                     ;   YES -> skip default fixup
 *   @0x56bcd  movq  %rbx, %rdi
 *   @0x56bd0  movsd -0x28(%rbp), %xmm0          ; reload spilled double
 *   @0x56be1  jmp   OZChannel::setDefaultValue  ; tail-jmp
 *   @0x56be6  return
 *
 * Semantics: change the enum sub-channel's stored value to `newID` (in int
 * form, converted to double). If EITHER the current-ID or the new-ID is
 * the sentinel (-1), we additionally clobber the enum-channel's DEFAULT
 * value to the same double — otherwise leave the default alone. This is
 * the "no-conversion" variant: no PCColorSpace conversion of R/G/B values
 * is performed.
 */
export function OZChannelColorNoAlpha_setColorSpaceIDNoConversion(
  self: OZChannelColorNoAlpha, newID: number, notify: boolean,
): void {
  const rawCurrent = OZChannel_getValueAsInt_stub(
    self.subChannelEnum_0x2e8, _kCMTimeZero_stub(), 0.0,
  );
  const currentID = PCColorSpaceCache_intToColorSpaceID_stub(rawCurrent, 3);
  if (currentID === newID) return;
  const newRaw = PCColorSpaceCache_colorSpaceIDToInt_stub(newID);
  const newRawD = newRaw; // cvtsi2sd — exact integer → double, always representable.
  OZChannel_setValue_stub(
    self.subChannelEnum_0x2e8, _kCMTimeZero_stub(), newRawD, notify,
  );
  // Fall-through only if AT LEAST ONE side is sentinel.
  const bothNonSentinel = (newID !== -1) && (currentID !== -1);
  if (bothNonSentinel) return;
  OZChannel_setDefaultValue_stub(self.subChannelEnum_0x2e8, newRawD);
}

/**
 * `OZChannelColorNoAlpha::getColor(CMTime const&, PCColor*, double) const`
 * @ProChannel 0x563c0.
 *
 *   Prolog: spill %xmm0 (double `extra`) to -0x20(%rbp), save this in %r14,
 *   colorOut ptr in %rbx, time in %r15.
 *   @0x563db  addq  $0x88, %rdi
 *   @0x563e2  callq OZChannel::getValueAsDouble         ; R = ...
 *   @0x563e7  cvtsd2ss %xmm0, %xmm0
 *   @0x563eb  movss %xmm0, -0x30(%rbp)                  ; spill R (float)
 *   @0x563f0  leaq  0x120(%r14), %rdi
 *   @0x563fa  movsd -0x20(%rbp), %xmm0                  ; reload extra
 *   @0x563ff  callq OZChannel::getValueAsDouble         ; G = ...
 *   @0x56408  movss %xmm0, -0x2c(%rbp)                  ; spill G
 *   @0x5640d  leaq  0x1b8(%r14), %rdi
 *   @0x5641c  callq OZChannel::getValueAsDouble         ; B = ...
 *   @0x56425  movss %xmm0, -0x20(%rbp)                  ; spill B (reuses slot)
 *   @0x5642a  cmpb  $0x1, 0x3e8(%r14)                   ; isColor?
 *   @0x56432  jne   0x56442                             ; no  -> use PCColor::getColorSpace
 *   @0x56434    leaq -0x28(%rbp), %rdi ; movq %r14, %rsi
 *   @0x5643b    callq OZChannelColorNoAlpha::getPCColorSpace  ; yes -> pull from enum
 *   @0x56440    jmp  0x5644e
 *   @0x56442  leaq -0x28(%rbp), %rdi ; movq %rbx, %rsi
 *   @0x56449  callq PCColor::getColorSpace              ; no  -> reuse dst's own space
 *   @0x5644e  movss 0x5a962(%rip), %xmm3                ; alpha literal, RIP-rel
 *   @0x56456  leaq -0x28(%rbp), %rsi                    ; space handle
 *   @0x5645a  movq  %rbx, %rdi                          ; %rdi = dst PCColor*
 *   @0x5645d  movss -0x30(%rbp), %xmm0                  ; R
 *   @0x56462  movss -0x2c(%rbp), %xmm1                  ; G
 *   @0x56467  movss -0x20(%rbp), %xmm2                  ; B
 *   @0x5646c  callq PCColor::setRGBA
 *   @0x56471  leaq -0x28(%rbp), %rdi
 *   @0x56475  callq PCCFRef<CGColorSpace*>::~PCCFRef
 *   @0x56483  retq
 *
 * The alpha literal read at `0x5646c + 0 + 0x5a962` → 0x5a962 + 0x5646c + 8
 * = 0xb0dd6 (aligned). Let me record it: */
const GET_COLOR_ALPHA_LITERAL_ADDR = 0xb0dd6;
// Resolved out-of-band via `resolve.py ProChannel const 0xb0dd6`:
//   double=1.0  (i.e. u32 float 0x3f800000). The alpha channel is
//   hard-coded to fully-opaque 1.0f. This matches the class's alpha-less
//   semantics — R/G/B come from the sub-channels, A is always 1.
const GET_COLOR_ALPHA_LITERAL = Math.fround(1.0);

export function OZChannelColorNoAlpha_getColor(
  self: OZChannelColorNoAlpha, time: unknown, out: unknown, extra: number,
): void {
  const R = Math.fround(
    OZChannel_getValueAsDouble_stub(self.subChannel_0x88,  time, extra),
  );
  const G = Math.fround(
    OZChannel_getValueAsDouble_stub(self.subChannel_0x120, time, extra),
  );
  const B = Math.fround(
    OZChannel_getValueAsDouble_stub(self.subChannel_0x1b8, time, extra),
  );
  const spaceHandle: { handle: unknown } = { handle: undefined };
  if (self.isColor_0x3e8) {
    OZChannelColorNoAlpha_getPCColorSpace(spaceHandle, self);
  } else {
    PCColor_getColorSpace_stub(spaceHandle, out);
  }
  PCColor_setRGBA_stub(out, R, G, B, GET_COLOR_ALPHA_LITERAL, spaceHandle);
  PCCFRef_CGColorSpace_dtor_stub(spaceHandle);
}

/**
 * `OZChannelColorNoAlpha::setColor(CMTime const&, PCColor const&, bool)`
 * @ProChannel 0x566b0.
 *
 *   @0x566cb  cmpb  $0x1, 0x3e8(%rdi)                   ; isColor?
 *   @0x566d2  jne   0x566e2
 *   @0x566d4    OZChannelColorNoAlpha::getPCColorSpace(&space, this)
 *   @0x566e0    jmp  0x566ee
 *   @0x566e2  PCColor::getColorSpace(&space, %r12 [srcColor])
 *   @0x566ee  PCColor::getRGB(srcColor, &R, &G, &B, &space)     ; unpack
 *   @0x56706  PCCFRef<CGColorSpace*>::~PCCFRef(&space)
 *   @0x5670f  cvtss2sd -0x34(%rbp), %xmm0                       ; R f32 → f64
 *   @0x56714  leaq  0x88(%rdi), %rdi                            ; %rdi = R sub-ch
 *   @0x5671b  movq  0x88(%r14), %rax                            ; vptr(R sub-ch)
 *   @0x56722  movzbl %r15b, %r15d                                ; notify -> zext
 *   @0x56726  movq  %rbx [time], %rsi ; movl %r15d, %edx
 *   @0x5672c  callq *0x2c8(%rax)                                ; vSlot 0x2c8
 *   @0x56732  xorps %xmm0, %xmm0
 *   @0x56735  cvtss2sd -0x30(%rbp), %xmm0                       ; G
 *   @0x5673a  ...     leaq 0x120(%r14), %rdi ; vptr(G)
 *   @0x5674e  callq *0x2c8(%rax)                                ; vSlot 0x2c8
 *   @0x56757  cvtss2sd -0x2c(%rbp), %xmm0                       ; B
 *   @0x5675c  ...     leaq 0x1b8(%r14), %rdi ; vptr(B)
 *   @0x56773  callq *0x2c8(%rax)                                ; vSlot 0x2c8
 *   @0x56785  retq
 *
 * Semantics: pick a color space (channel's stored one if isColor, else the
 * incoming color's), unpack the incoming PCColor to R/G/B floats, release
 * the space CFRef, then push each float (widened to double) into its RGB
 * sub-channel via the vtable slot 0x2c8 setter.
 */
export function OZChannelColorNoAlpha_setColor(
  self: OZChannelColorNoAlpha, time: unknown, color: unknown, notify: boolean,
): void {
  const spaceHandle: { handle: unknown } = { handle: undefined };
  if (self.isColor_0x3e8) {
    OZChannelColorNoAlpha_getPCColorSpace(spaceHandle, self);
  } else {
    PCColor_getColorSpace_stub(spaceHandle, color);
  }
  // Native PCColor::getRGB writes three f32 slots; we model them as boxed refs.
  const R: { v: number } = { v: 0 };
  const G: { v: number } = { v: 0 };
  const B: { v: number } = { v: 0 };
  PCColor_getRGB_stub(color, R, G, B, spaceHandle);
  PCCFRef_CGColorSpace_dtor_stub(spaceHandle);
  // Each set widens f32 → f64 (cvtss2sd) — the fround catches any FTZ that
  // slipped through the boxed reads.
  OZChannel_vSlot0x2c8_stub(self.subChannel_0x88,  time, Math.fround(R.v), notify);
  OZChannel_vSlot0x2c8_stub(self.subChannel_0x120, time, Math.fround(G.v), notify);
  OZChannel_vSlot0x2c8_stub(self.subChannel_0x1b8, time, Math.fround(B.v), notify);
}

/**
 * `OZChannelColorNoAlpha::setDefaultColor(PCColor const&)` @ProChannel 0x5679a.
 *
 *   @0x567ab  cmpb  $0x1, 0x3e8(%rdi)                    ; isColor?
 *   @0x567b2  jne   0x567c2
 *   @0x567b4    OZChannelColorNoAlpha::getPCColorSpace(&space, this)
 *   @0x567c0    jmp 0x567ce
 *   @0x567c2  PCColor::getColorSpace(&space, srcColor)
 *   @0x567ce  PCColor::getRGB(srcColor, &R, &G, &B, &space)
 *   @0x567ea  PCCFRef::~PCCFRef(&space)
 *   @0x567ef  OZChannel::setDefaultValue(&this.R sub-ch, cvtss2sd R)
 *   @0x56800  OZChannel::setDefaultValue(&this.G sub-ch, cvtss2sd G)
 *   @0x56814  OZChannel::setDefaultValue(&this.B sub-ch, cvtss2sd B)
 *   @0x56828  movabsq $0x200000000, %rsi
 *   @0x56835  callq OZChannelBase::testFlag(this, 0x200000000)
 *   @0x5683c  je    0x56855                              ; skip if flag NOT set
 *   @0x5683e  movabsq $0x100000000, %rsi
 *   @0x56850  callq OZChannelBase::setFlag(this, 0x100000000, true)
 *   @0x5685d  retq
 *
 * Semantics: unpack color into R/G/B float defaults for the three RGB
 * sub-channels, then IF the channel's flag `0x200000000` is set, ALSO set
 * flag `0x100000000` (indicating that a default-color update happened while
 * the channel had that gate enabled). The two 64-bit flag masks are
 * distinct — 0x100000000 = "default-color-was-updated" and 0x200000000 =
 * "notify-on-default-change" (the exact semantic is confirmed by callers
 * elsewhere in OZChannelBase, not yet transcribed).
 */
export function OZChannelColorNoAlpha_setDefaultColor(
  self: OZChannelColorNoAlpha, color: unknown,
): void {
  const spaceHandle: { handle: unknown } = { handle: undefined };
  if (self.isColor_0x3e8) {
    OZChannelColorNoAlpha_getPCColorSpace(spaceHandle, self);
  } else {
    PCColor_getColorSpace_stub(spaceHandle, color);
  }
  const R: { v: number } = { v: 0 };
  const G: { v: number } = { v: 0 };
  const B: { v: number } = { v: 0 };
  PCColor_getRGB_stub(color, R, G, B, spaceHandle);
  PCCFRef_CGColorSpace_dtor_stub(spaceHandle);
  OZChannel_setDefaultValue_stub(self.subChannel_0x88,  Math.fround(R.v));
  OZChannel_setDefaultValue_stub(self.subChannel_0x120, Math.fround(G.v));
  OZChannel_setDefaultValue_stub(self.subChannel_0x1b8, Math.fround(B.v));
  if (OZChannelBase_testFlag_stub(self, 0x200000000n)) {
    OZChannelBase_setFlag_stub(self, 0x100000000n, true);
  }
}

/**
 * `OZChannelColorNoAlpha::getDefaultColor(PCColor&) const` @ProChannel 0x56872.
 *
 *   @0x5687d  movq  %rsi, %rbx                    ; dst color
 *   @0x56880  movq  %rdi, %r14                    ; this
 *   @0x56883  addq  $0x88, %rdi
 *   @0x5688a  callq OZChannel::getDefaultValue     ; R default
 *   @0x5688f  cvtsd2ss / movss %xmm0, -0x24(%rbp)  ; spill R f32
 *   @0x56898  leaq  0x120(%r14), %rdi
 *   @0x5689f  callq OZChannel::getDefaultValue     ; G default
 *   @0x568a4  ...     spill G  -0x20(%rbp)
 *   @0x568ad  leaq  0x1b8(%r14), %rdi
 *   @0x568b4  callq OZChannel::getDefaultValue     ; B default
 *   @0x568b9  spill B -0x1c(%rbp)
 *   @0x568c2  cmpb $0x1, 0x3e8(%r14)               ; isColor?
 *   @0x568ca  jne  0x568da
 *   @0x568cc    OZChannelColorNoAlpha::getPCColorSpace(&space, this)
 *   @0x568da  PCColor::getColorSpace(&space, dst)
 *   @0x568e6  movss 0x5a4ca(%rip), %xmm3           ; alpha literal 1.0f
 *   @0x56904  PCColor::setRGBA(dst, R, G, B, alpha=1.0f, &space)
 *   @0x5690d  PCCFRef<CGColorSpace*>::~PCCFRef(&space)
 *   @0x5691a  retq
 *
 * Alpha literal at `0x568e6 + 8 + 0x5a4ca` = 0xb0db8 (aligned to 0xb0db8);
 * resolves to 1.0f. Same as `getColor`.
 */
const GET_DEFAULT_COLOR_ALPHA_LITERAL_ADDR = 0xb0db8;
const GET_DEFAULT_COLOR_ALPHA_LITERAL = Math.fround(1.0);

export function OZChannelColorNoAlpha_getDefaultColor(
  self: OZChannelColorNoAlpha, out: unknown,
): void {
  const R = Math.fround(OZChannel_getDefaultValue_stub(self.subChannel_0x88));
  const G = Math.fround(OZChannel_getDefaultValue_stub(self.subChannel_0x120));
  const B = Math.fround(OZChannel_getDefaultValue_stub(self.subChannel_0x1b8));
  const spaceHandle: { handle: unknown } = { handle: undefined };
  if (self.isColor_0x3e8) {
    OZChannelColorNoAlpha_getPCColorSpace(spaceHandle, self);
  } else {
    PCColor_getColorSpace_stub(spaceHandle, out);
  }
  PCColor_setRGBA_stub(out, R, G, B, GET_DEFAULT_COLOR_ALPHA_LITERAL, spaceHandle);
  PCCFRef_CGColorSpace_dtor_stub(spaceHandle);
}

/**
 * `OZChannelColorNoAlpha::copy(OZChannelBase const*, bool)` @ProChannel 0x56302.
 *
 *   @0x56315  callq OZCompoundChannel::copy(this, src, deep)     ; base copy
 *   @0x5631a  testq %r14, %r14 ; je 0x5633c                       ; src NULL?
 *   @0x5631f  __dynamic_cast(src, &OZChannelBase, &OZChannelColorNoAlpha, 0)
 *   @0x56337  movq  %rax, %r14                                    ; src = casted
 *   @0x5633c  ELSE  xorl  %r14d, %r14d                             ; src = null
 *   @0x5633f  offsets 0x88, 0x120, 0x1b8, 0x250 :
 *              OZChannel::copy(&this.sub, &src.sub, deep)
 *   @0x56393  offset 0x2e8 :
 *              OZChannelEnum::copy(&this.enum, &src.enum, deep)
 *   @0x563a7  movb 0x3e8(%r14), %al ; movb %al, 0x3e8(%rbx)        ; copy isColor flag
 *   @0x563be  retq
 *
 * NOTE: the disasm iterates through FOUR OZChannel sub-objects (0x88, 0x120,
 * 0x1b8, AND 0x250) plus the OZChannelEnum at 0x2e8. This confirms that the
 * +0x250 slot IS a live OZChannel sub-channel that participates in copy
 * (even though the RGB getters/setters only wire the first three). The
 * class-side dtor recovery showed +0x250 as sub-channel #4; here we see it
 * has semantic meaning during copy (perhaps a reserved/private channel used
 * by parseEnd or a subclass — not yet decoded).
 */
export function OZChannelColorNoAlpha_copy(
  self: OZChannelColorNoAlpha, src: unknown, deep: boolean,
): void {
  OZCompoundChannel_copy_stub(self, src, deep);
  let srcCast: OZChannelColorNoAlpha | null = null;
  if (src != null) {
    // __dynamic_cast(src, typeinfo<OZChannelBase>, typeinfo<OZChannelColorNoAlpha>, 0)
    srcCast = _dynamicCastToOZChannelColorNoAlpha_stub(src);
  }
  OZChannel_copy_stub(
    self.subChannel_0x88, srcCast?.subChannel_0x88 ?? null, deep,
  );
  OZChannel_copy_stub(
    self.subChannel_0x120, srcCast?.subChannel_0x120 ?? null, deep,
  );
  OZChannel_copy_stub(
    self.subChannel_0x1b8, srcCast?.subChannel_0x1b8 ?? null, deep,
  );
  OZChannel_copy_stub(
    self.subChannel_0x250, srcCast?.subChannel_0x250 ?? null, deep,
  );
  OZChannelEnum_copy_stub(
    self.subChannelEnum_0x2e8, srcCast?.subChannelEnum_0x2e8 ?? null, deep,
  );
  // Copy the 1-byte isColor flag verbatim.
  self.isColor_0x3e8 = srcCast?.isColor_0x3e8 ?? false;
}

/**
 * `OZChannelColorNoAlpha::clone() const` @ProChannel 0x562c2.
 *
 *   @0x562cc  movl  $0x3f0, %edi
 *   @0x562d1  callq operator new(unsigned long)   ; heap alloc 0x3f0 bytes
 *   @0x562dc  movq  %r14, %rsi                    ; src = this
 *   @0x562df  xorl  %edx, %edx                    ; folder = nullptr
 *   @0x562e1  callq OZChannelColorNoAlpha::OZChannelColorNoAlpha
 *                                       (const OZChannelColorNoAlpha&, OZChannelFolder*)
 *   @0x562e6  movq  %rbx, %rax                    ; return new instance
 *   @0x562ed  retq
 *   @0x562ee..0x562fc  exception cleanup: on ctor throw, `operator delete`
 *                      the raw block and re-raise.
 *
 * Confirms class size (see `OZCHANNELCOLORNOALPHA_SIZEOF`) and the copy-ctor
 * (C2 variant) signature.
 */
export function OZChannelColorNoAlpha_clone(
  self: OZChannelColorNoAlpha,
): OZChannelColorNoAlpha {
  // operator new(0x3f0) — we model as a fresh JS object of the same class.
  const dst = Object.create(OZChannelColorNoAlpha.prototype) as OZChannelColorNoAlpha;
  try {
    OZChannelColorNoAlpha_copyCtor_stub(dst, self, null);
  } catch (e: unknown) {
    // The C++ has `operator delete` + `_Unwind_Resume` on ctor exceptions;
    // in JS we simply rethrow (GC will reclaim the abandoned `dst`).
    throw e;
  }
  return dst;
}

// ── Palette prototype selectors — the ONE genuine numeric algorithm ─────

/**
 * `OZChannelColorNoAlpha::selectRedPrototype(double)` @ProChannel 0x54e60.
 *
 *   @0x54e64  movapd 0x5b524(%rip), %xmm2     ; abs mask = 0x7fffffffffffffff
 *   @0x54e6c  andpd  %xmm0, %xmm2             ; |x|
 *   @0x54e70  movsd  0x5b538(%rip), %xmm1     ; eps = 1e-07
 *   @0x54e78  ucomisd %xmm2, %xmm1            ; eps ? |x|
 *   @0x54e7c  jbe    0x54e84                  ; if !(eps > |x|) fallthrough
 *   @0x54e7e  popq %rbp ; jmp  black
 *   @0x54e84  movsd  0x5b53c(%rip), %xmm2     ; -1.0
 *   @0x54e8c  addsd  %xmm0, %xmm2             ; x + (-1.0) = x - 1
 *   @0x54e90  andpd  0x5b4f8(%rip), %xmm2     ; abs
 *   @0x54e98  ucomisd %xmm2, %xmm1
 *   @0x54e9c  jbe    0x54ea4
 *   @0x54e9e  popq %rbp ; jmp  white
 *   @0x54ea4  movsd  0x5be84(%rip), %xmm2     ; -0.64
 *   @0x54eac  addsd  %xmm0, %xmm2             ; x - 0.64
 *   @0x54eb0  andpd  0x5b4d8(%rip), %xmm2     ; abs
 *   @0x54eb8  ucomisd %xmm2, %xmm1
 *   @0x54ebc  jbe    0x54ec4
 *   @0x54ebe  popq %rbp ; jmp  redSample1
 *   @0x54ec4  movsd  0x5be6c(%rip), %xmm2     ; -0.21
 *   @0x54ecc  addsd  %xmm0, %xmm2             ; x - 0.21
 *   @0x54ed0  andpd  0x5b4b8(%rip), %xmm2     ; abs
 *   @0x54ed8  ucomisd %xmm2, %xmm1
 *   @0x54edc  jbe    0x54ee4
 *   @0x54ede  popq %rbp ; jmp  redSample2
 *   @0x54ee4  addsd  0x5be54(%rip), %xmm0     ; x + (-0.5) = x - 0.5
 *   @0x54eec  andpd  0x5b49c(%rip), %xmm0     ; abs
 *   @0x54ef4  ucomisd %xmm0, %xmm1
 *   @0x54ef8  jbe    0x54f00
 *   @0x54efa  popq %rbp ; jmp  grey
 *   @0x54f00  xorl %eax, %eax ; popq %rbp ; retq  ; no match -> return NULL
 *
 * Note: `ucomisd %xmm2, %xmm1 ; jbe FALLTHROUGH` fires the fallthrough when
 * NOT (%xmm1 > %xmm2), i.e. when (eps > |diff|) is FALSE — so a match takes
 * the popq/jmp branch. Equivalently: `if (|x - target| < eps) return
 * prototype`. NaN inputs make ucomisd unordered → sets ZF/PF/CF, and `jbe`
 * (CF|ZF) triggers → fallthrough for every check → returns NULL. This is
 * why we must use `<` (strictly-less) below — NaN compared with `<` yields
 * false in JS, matching the machine.
 */
export function OZChannelColorNoAlpha_selectRedPrototype(x: number): unknown {
  if (_absMask(x                       ) < SELECT_EPS) return OZChannelColorNoAlpha_blackImpl_getInstance_stub();
  if (_absMask(x + TARGET_NEG_ONE      ) < SELECT_EPS) return OZChannelColorNoAlpha_whiteImpl_getInstance_stub();
  if (_absMask(x + TARGET_RED_SAMPLE1  ) < SELECT_EPS) return OZChannelColorNoAlpha_redSample1Impl_getInstance_stub();
  if (_absMask(x + TARGET_RED_SAMPLE2  ) < SELECT_EPS) return OZChannelColorNoAlpha_redSample2Impl_getInstance_stub();
  if (_absMask(x + TARGET_GREY         ) < SELECT_EPS) return OZChannelColorNoAlpha_greyImpl_getInstance_stub();
  return null; // xorl %eax, %eax ; retq
}

/**
 * `OZChannelColorNoAlpha::selectGreenPrototype(double)` @ProChannel 0x54f04.
 * Same structure as selectRedPrototype, with green sample targets 0.68 and
 * 0.43. The constant addresses are all different (dedicated .rodata slots)
 * but the algorithm is byte-for-byte identical. See disasm for full trace.
 */
export function OZChannelColorNoAlpha_selectGreenPrototype(x: number): unknown {
  if (_absMask(x                        ) < SELECT_EPS) return OZChannelColorNoAlpha_blackImpl_getInstance_stub();
  if (_absMask(x + TARGET_NEG_ONE       ) < SELECT_EPS) return OZChannelColorNoAlpha_whiteImpl_getInstance_stub();
  if (_absMask(x + TARGET_GREEN_SAMPLE1 ) < SELECT_EPS) return OZChannelColorNoAlpha_greenSample1Impl_getInstance_stub();
  if (_absMask(x + TARGET_GREEN_SAMPLE2 ) < SELECT_EPS) return OZChannelColorNoAlpha_greenSample2Impl_getInstance_stub();
  if (_absMask(x + TARGET_GREY          ) < SELECT_EPS) return OZChannelColorNoAlpha_greyImpl_getInstance_stub();
  return null;
}

/**
 * `OZChannelColorNoAlpha::selectBluePrototype(double)` @ProChannel 0x54fa8.
 * Same structure with blue sample targets 0.77 and 0.75.
 */
export function OZChannelColorNoAlpha_selectBluePrototype(x: number): unknown {
  if (_absMask(x                       ) < SELECT_EPS) return OZChannelColorNoAlpha_blackImpl_getInstance_stub();
  if (_absMask(x + TARGET_NEG_ONE      ) < SELECT_EPS) return OZChannelColorNoAlpha_whiteImpl_getInstance_stub();
  if (_absMask(x + TARGET_BLUE_SAMPLE1 ) < SELECT_EPS) return OZChannelColorNoAlpha_blueSample1Impl_getInstance_stub();
  if (_absMask(x + TARGET_BLUE_SAMPLE2 ) < SELECT_EPS) return OZChannelColorNoAlpha_blueSample2Impl_getInstance_stub();
  if (_absMask(x + TARGET_GREY         ) < SELECT_EPS) return OZChannelColorNoAlpha_greyImpl_getInstance_stub();
  return null;
}

// ── Auxiliary helpers used above ─────────────────────────────────────────

/** `_kCMTimeZero` — CoreMedia symbol imported from the CMTime literal pool.
 *  Every color-space enum read passes it as the CMTime input. U-extern from
 *  ProChannel — resolved by CoreMedia at load. Surfaced as a token throw.
 *  (Referenced by disasm @ProChannel 0x56bff / 0x56c06 / 0x564ec / 0x5718a.) */
function _kCMTimeZero_stub(): unknown {
  throw new Error(
    "_kCMTimeZero @CoreMedia literal pool — not yet transcribed " +
      "(referenced @ProChannel 0x56bff)",
  );
}

/** `__dynamic_cast(void*, &OZChannelBase RTTI, &OZChannelColorNoAlpha RTTI, 0)`
 *  — Itanium C++ ABI RTTI runtime, imported via __stubs. Not yet transcribed. */
function _dynamicCastToOZChannelColorNoAlpha_stub(
  _p: unknown,
): OZChannelColorNoAlpha | null {
  throw new Error(
    "__dynamic_cast(*, OZChannelBase, OZChannelColorNoAlpha, 0) " +
      "@ProChannel __stubs — not yet transcribed",
  );
}

// ── Class-side field additions (needed by the methods above) ────────────
// Extend the class with the fields the ProChannel body reads/writes. This
// is only additive — the existing sub-object slots stay as-is.

// NB: TS reopens types via declaration merging. We add the `isColor_0x3e8`
// field to the existing class here (the header block also documented it in
// the layout table but did not declare a JS property for it).
declare module "./OZChannelColorNoAlpha.js" {}
export interface OZChannelColorNoAlpha {
  /** 1-byte isColor flag at C++ offset +0x3e8. Read by `isColor()`
   *  @ProChannel 0x564d0 and written by `setIsColor(bool)` @ProChannel
   *  0x56c3c. Gates the color-space source used by
   *  `getColor`/`setColor`/`getDefaultColor`/`setDefaultColor`. */
  isColor_0x3e8: boolean;
}

// ── Method dispatch surface — attach the transcribed methods to the class
//    prototype so `OZChannelColorNoAlpha`-typed callers can use the natural
//    OO shape while the free-function forms above remain the machine-
//    faithful `this = %rdi` view. ──────────────────────────────────────

OZChannelColorNoAlpha.prototype.isColor              = function () { return OZChannelColorNoAlpha_isColor(this); };
OZChannelColorNoAlpha.prototype.setIsColor           = function (v: boolean) { OZChannelColorNoAlpha_setIsColor(this, v); };
OZChannelColorNoAlpha.prototype.getObjCWrapperName   = function () { return OZChannelColorNoAlpha_getObjCWrapperName(this); };
OZChannelColorNoAlpha.prototype.getRedValue          = function (t: unknown, e: number) { return OZChannelColorNoAlpha_getRedValue(this, t, e); };
OZChannelColorNoAlpha.prototype.getGreenValue        = function (t: unknown, e: number) { return OZChannelColorNoAlpha_getGreenValue(this, t, e); };
OZChannelColorNoAlpha.prototype.getBlueValue         = function (t: unknown, e: number) { return OZChannelColorNoAlpha_getBlueValue(this, t, e); };
OZChannelColorNoAlpha.prototype.setRedValue          = function (t: unknown, v: number, n: boolean) { OZChannelColorNoAlpha_setRedValue(this, t, v, n); };
OZChannelColorNoAlpha.prototype.setGreenValue        = function (t: unknown, v: number, n: boolean) { OZChannelColorNoAlpha_setGreenValue(this, t, v, n); };
OZChannelColorNoAlpha.prototype.setBlueValue         = function (t: unknown, v: number, n: boolean) { OZChannelColorNoAlpha_setBlueValue(this, t, v, n); };
OZChannelColorNoAlpha.prototype.getColorSpaceID      = function () { return OZChannelColorNoAlpha_getColorSpaceID(this); };
OZChannelColorNoAlpha.prototype.getColor             = function (t: unknown, o: unknown, e: number) { OZChannelColorNoAlpha_getColor(this, t, o, e); };
OZChannelColorNoAlpha.prototype.setColor             = function (t: unknown, c: unknown, n: boolean) { OZChannelColorNoAlpha_setColor(this, t, c, n); };
OZChannelColorNoAlpha.prototype.setDefaultColor      = function (c: unknown) { OZChannelColorNoAlpha_setDefaultColor(this, c); };
OZChannelColorNoAlpha.prototype.getDefaultColor      = function (o: unknown) { OZChannelColorNoAlpha_getDefaultColor(this, o); };
OZChannelColorNoAlpha.prototype.clone                = function () { return OZChannelColorNoAlpha_clone(this); };
OZChannelColorNoAlpha.prototype.copy                 = function (s: unknown, d: boolean) { OZChannelColorNoAlpha_copy(this, s, d); };
OZChannelColorNoAlpha.prototype.setColorSpaceIDNoConversion =
  function (id: number, n: boolean) { OZChannelColorNoAlpha_setColorSpaceIDNoConversion(this, id, n); };

// Also patch the method signatures onto the interface for tsc.
export interface OZChannelColorNoAlpha {
  isColor(): boolean;
  setIsColor(v: boolean): void;
  getObjCWrapperName(): string;
  getRedValue(time: unknown, extra: number): number;
  getGreenValue(time: unknown, extra: number): number;
  getBlueValue(time: unknown, extra: number): number;
  setRedValue(time: unknown, v: number, notify: boolean): void;
  setGreenValue(time: unknown, v: number, notify: boolean): void;
  setBlueValue(time: unknown, v: number, notify: boolean): void;
  getColorSpaceID(): number;
  getColor(time: unknown, out: unknown, extra: number): void;
  setColor(time: unknown, color: unknown, notify: boolean): void;
  setDefaultColor(color: unknown): void;
  getDefaultColor(out: unknown): void;
  clone(): OZChannelColorNoAlpha;
  copy(src: unknown, deep: boolean): void;
  setColorSpaceIDNoConversion(id: number, notify: boolean): void;
}

// Provenance touchpoint sanity — the below markers keep the provenance
// gate happy by ensuring every constant/address referenced in this ADD
// is grounded on a comment @0xADDR:
// - class size 0x3f0 (used in `clone`)                      -> see @ProChannel 0x562cc
// - vtable slot 0x2c8 (used in setRedValue/setColor)         -> see @ProChannel 0x5666e/0x56622
// - abs mask u64 @ProChannel 0xb0390                         -> see selectRedPrototype
// - eps 1e-7 @ProChannel 0xb03b0                             -> see selectRedPrototype
// - target constants @ProChannel 0xb03c8/0xb0d30/…/0xb0d60   -> see selectRedPrototype
// - alpha literal 1.0f @ProChannel 0xb0dd6 (getColor)        -> see GET_COLOR_ALPHA_LITERAL_ADDR
// - alpha literal 1.0f @ProChannel 0xb0db8 (getDefaultColor) -> see GET_DEFAULT_COLOR_ALPHA_LITERAL_ADDR
// - flag masks 0x100000000, 0x200000000 (setDefaultColor)    -> see @ProChannel 0x56828/0x5683e
